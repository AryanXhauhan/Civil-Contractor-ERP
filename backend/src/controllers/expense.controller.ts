import { Request, Response } from 'express';
import { prisma } from '../index';
import Joi from 'joi';

const expenseSchema = Joi.object({
  projectId: Joi.string().required(),
  vendorId: Joi.string().allow(null),
  category: Joi.string().required(), // MATERIAL, LABOUR, EQUIPMENT, TRANSPORT, ELECTRICITY, FUEL, SUBCONTRACTOR, MISCELLANEOUS
  amount: Joi.number().min(0).required(),
  date: Joi.date().required(),
  description: Joi.string().allow('', null),
  isPaid: Joi.boolean().default(false)
});

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId: String(projectId) } : {};

    const expenses = await prisma.expense.findMany({
      where: filter,
      include: {
        project: { select: { name: true } },
        vendor: { select: { name: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { error } = expenseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const expense = await prisma.expense.create({
      data: req.body
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = expenseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: req.body
    });

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({
      where: { id }
    });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};
