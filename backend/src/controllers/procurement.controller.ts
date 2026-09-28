import { Request, Response } from 'express';
import { prisma } from '../index';
import Joi from 'joi';

const poSchema = Joi.object({
  projectId: Joi.string().required(),
  vendorId: Joi.string().required(),
  status: Joi.string().valid('DRAFT', 'SENT', 'PARTIAL', 'COMPLETED').default('DRAFT'),
  items: Joi.array().items(
    Joi.object({
      materialId: Joi.string().required(),
      quantity: Joi.number().min(0.01).required(),
      rate: Joi.number().min(0).required()
    })
  ).min(1).required()
});

export const getPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId: String(projectId) } : {};

    const pos = await prisma.purchaseOrder.findMany({
      where: filter,
      include: {
        vendor: { select: { name: true, company: true } },
        project: { select: { name: true } },
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
};

export const getPurchaseOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        project: true,
        items: {
          include: { material: { select: { name: true, unit: true } } }
        }
      }
    });

    if (!po) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }

    res.json(po);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
};

export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { error } = poSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { projectId, vendorId, status, items } = req.body;
    
    // Generate a simple PO number
    const count = await prisma.purchaseOrder.count();
    const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Calculate total amount
    const totalAmount = items.reduce((acc: number, item: any) => acc + (item.quantity * item.rate), 0);

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        projectId,
        vendorId,
        status,
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            materialId: item.materialId,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate
          }))
        }
      },
      include: { items: true }
    });

    res.status(201).json(po);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
};

export const updatePurchaseOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'SENT', 'PARTIAL', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const po = await prisma.purchaseOrder.update({
      where: { id },
      data: { status }
    });

    res.json(po);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update purchase order status' });
  }
};
