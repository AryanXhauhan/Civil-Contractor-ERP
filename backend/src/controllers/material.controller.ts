import { Request, Response } from 'express';
import { prisma } from '../index';
import Joi from 'joi';

const materialSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().required(),
  unit: Joi.string().required(),
  minStock: Joi.number().min(0).default(0),
});

export const getMaterials = async (req: Request, res: Response) => {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
};

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const { error } = materialSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const material = await prisma.material.create({
      data: req.body
    });

    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create material' });
  }
};

const transactionSchema = Joi.object({
  materialId: Joi.string().required(),
  projectId: Joi.string().allow(null),
  vendorId: Joi.string().allow(null),
  type: Joi.string().valid('RECEIVED', 'CONSUMED', 'RETURNED', 'ADJUSTMENT').required(),
  quantity: Joi.number().required(),
  rate: Joi.number().min(0).allow(null),
  invoiceNo: Joi.string().allow('', null),
  notes: Joi.string().allow('', null),
});

export const addMaterialTransaction = async (req: Request, res: Response) => {
  try {
    const { error } = transactionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { materialId, type, quantity, rate, projectId, vendorId, invoiceNo, notes } = req.body;

    // Start a transaction to ensure atomic updates
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.materialTransaction.create({
        data: {
          materialId,
          type,
          quantity,
          rate,
          projectId,
          vendorId,
          invoiceNo,
          notes
        }
      });

      // Update material stock
      let stockDelta = 0;
      if (type === 'RECEIVED' || type === 'RETURNED' || type === 'ADJUSTMENT' && quantity > 0) {
        stockDelta = quantity;
      } else if (type === 'CONSUMED' || type === 'ADJUSTMENT' && quantity < 0) {
        stockDelta = -Math.abs(quantity);
      }

      await tx.material.update({
        where: { id: materialId },
        data: {
          currentStock: {
            increment: stockDelta
          }
        }
      });

      // If it's a receipt with rate, optionally update avg purchase rate
      // And optionally create an expense for the project
      if (type === 'RECEIVED' && rate && projectId && vendorId) {
         const amount = quantity * rate;
         const expense = await tx.expense.create({
           data: {
             projectId,
             vendorId,
             category: 'MATERIAL',
             amount,
             description: `Material Receipt: ${invoiceNo || 'N/A'}`,
             isPaid: false
           }
         });
         
         await tx.materialTransaction.update({
           where: { id: transaction.id },
           data: { expenseId: expense.id }
         });
      }

      return transaction;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process material transaction' });
  }
};
