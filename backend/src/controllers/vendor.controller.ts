import { Request, Response } from 'express';
import { prisma } from '../index';
import Joi from 'joi';

const vendorSchema = Joi.object({
  name: Joi.string().required(),
  company: Joi.string().allow('', null),
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  gstin: Joi.string().allow('', null),
  address: Joi.string().allow('', null),
  categories: Joi.array().items(Joi.string()).default([]),
});

export const getVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        _count: {
          select: { purchaseOrders: true, expenses: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

export const createVendor = async (req: Request, res: Response) => {
  try {
    const { error } = vendorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const vendor = await prisma.vendor.create({
      data: req.body
    });

    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create vendor' });
  }
};

export const updateVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = vendorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: req.body
    });

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update vendor' });
  }
};
