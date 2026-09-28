import { Request, Response } from 'express';
import { prisma } from '../index';
import Joi from 'joi';

const boqItemSchema = Joi.object({
  projectId: Joi.string().required(),
  itemCode: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  unit: Joi.string().required(),
  estimatedQty: Joi.number().min(0).required(),
  rate: Joi.number().min(0).required(),
});

export const getBOQByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const boqItems = await prisma.bOQItem.findMany({
      where: { projectId },
      orderBy: { category: 'asc' }
    });
    
    // Add calculated fields
    const enrichedItems = boqItems.map(item => ({
      ...item,
      estimatedAmount: item.estimatedQty * item.rate,
      actualAmount: item.actualQty * item.rate
    }));

    res.json(enrichedItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BOQ items' });
  }
};

export const createBOQItem = async (req: Request, res: Response) => {
  try {
    const { error } = boqItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const item = await prisma.bOQItem.create({
      data: req.body
    });

    res.status(201).json({
      ...item,
      estimatedAmount: item.estimatedQty * item.rate,
      actualAmount: item.actualQty * item.rate
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create BOQ item' });
  }
};

export const updateBOQItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = boqItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const item = await prisma.bOQItem.update({
      where: { id },
      data: req.body
    });

    res.json({
      ...item,
      estimatedAmount: item.estimatedQty * item.rate,
      actualAmount: item.actualQty * item.rate
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update BOQ item' });
  }
};

export const deleteBOQItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.bOQItem.delete({
      where: { id }
    });
    res.json({ message: 'BOQ item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete BOQ item' });
  }
};
