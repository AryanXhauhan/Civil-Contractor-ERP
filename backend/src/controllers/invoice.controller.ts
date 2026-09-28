import { Request, Response } from 'express';
import { prisma } from '../index';
import Joi from 'joi';

const invoiceSchema = Joi.object({
  projectId: Joi.string().required(),
  clientId: Joi.string().required(),
  billingPeriod: Joi.string().allow('', null),
  dueDate: Joi.date().allow(null),
  items: Joi.array().items(
    Joi.object({
      description: Joi.string().required(),
      quantity: Joi.number().min(0).required(),
      rate: Joi.number().min(0).required()
    })
  ).min(1).required(),
  taxRate: Joi.number().min(0).default(0) // percentage
});

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: { select: { name: true } },
        project: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        items: true,
        payments: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { error } = invoiceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { projectId, clientId, billingPeriod, dueDate, items, taxRate } = req.body;

    // Generate Invoice Number
    const count = await prisma.invoice.count();
    const invoiceNo = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const subtotal = items.reduce((acc: number, item: any) => acc + (item.quantity * item.rate), 0);
    const taxes = (subtotal * taxRate) / 100;
    const total = subtotal + taxes;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        projectId,
        clientId,
        billingPeriod,
        dueDate,
        subtotal,
        taxes,
        total,
        status: 'DRAFT',
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate
          }))
        }
      },
      include: { items: true }
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

export const updateInvoiceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status }
    });

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
};
