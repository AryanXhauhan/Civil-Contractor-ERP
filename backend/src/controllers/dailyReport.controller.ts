import { Request, Response } from 'express';
import { prisma } from '../index';
import Joi from 'joi';

const dailyReportSchema = Joi.object({
  projectId: Joi.string().required(),
  date: Joi.date().default(() => new Date()),
  weather: Joi.string().allow('', null),
  workforceCount: Joi.number().min(0).default(0),
  workCompleted: Joi.string().allow('', null),
  materialsUsed: Joi.string().allow('', null),
  equipmentUsed: Joi.string().allow('', null),
  problems: Joi.string().allow('', null),
  safetyIncidents: Joi.string().allow('', null),
  notes: Joi.string().allow('', null),
});

export const getDailyReports = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId: String(projectId) } : {};

    const reports = await prisma.dailyReport.findMany({
      where: filter,
      include: {
        project: { select: { name: true } },
        engineer: { select: { firstName: true, lastName: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily reports' });
  }
};

export const getDailyReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await prisma.dailyReport.findUnique({
      where: { id },
      include: {
        project: true,
        engineer: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Daily report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily report' });
  }
};

export const createDailyReport = async (req: Request, res: Response) => {
  try {
    const { error } = dailyReportSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const report = await prisma.dailyReport.create({
      data: {
        ...req.body,
        engineerId: req.user!.userId
      }
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create daily report' });
  }
};

export const updateDailyReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = dailyReportSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const report = await prisma.dailyReport.update({
      where: { id },
      data: req.body
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update daily report' });
  }
};
