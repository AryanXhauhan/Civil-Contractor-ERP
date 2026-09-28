import { Request, Response } from 'express';
import { prisma } from '../index';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Joi from 'joi';

// Ensure Razorpay instance is safely instantiated
let razorpay: Razorpay | null = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export const createPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { invoiceId, amount } = req.body;

    if (!invoiceId || !amount) {
      return res.status(400).json({ error: 'invoiceId and amount are required' });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (!razorpay) {
      return res.status(500).json({ error: 'Razorpay is not configured' });
    }

    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: 'INR',
      receipt: `receipt_${invoiceId}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    // Create a pending payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        amount,
        status: 'PENDING',
        razorpayOrderId: order.id,
        paymentMethod: 'ONLINE'
      }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
      return res.status(400).json({ error: 'Missing required payment verification details' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    
    // Create signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED' }
      });
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Payment is valid
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCESS',
        razorpayPaymentId: razorpay_payment_id
      },
      include: { invoice: true }
    });

    // Update Invoice status automatically
    // In a real app we'd calculate total paid vs invoice total
    await prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'PAID' }
    });

    res.json({ message: 'Payment verified successfully', payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const signature = req.headers['x-razorpay-signature'] as string;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const paymentPayload = req.body.payload.payment.entity;

    // Idempotent processing
    if (event === 'payment.captured') {
      const orderId = paymentPayload.order_id;
      
      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId }
      });

      if (payment && payment.status !== 'SUCCESS') {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCESS',
            razorpayPaymentId: paymentPayload.id
          }
        });

        await prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: 'PAID' } // Simplification
        });
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        invoice: { select: { invoiceNo: true } },
        client: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};
