import { Request, Response } from 'express';
import { prisma } from '../index';
import Joi from 'joi';

const labourSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().required(),
  phone: Joi.string().allow('', null),
  dailyWage: Joi.number().min(0).required(),
});

export const getLabours = async (req: Request, res: Response) => {
  try {
    const labours = await prisma.labour.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(labours);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch labour records' });
  }
};

export const createLabour = async (req: Request, res: Response) => {
  try {
    const { error } = labourSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const labour = await prisma.labour.create({
      data: req.body
    });

    res.status(201).json(labour);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create labour record' });
  }
};

const attendanceSchema = Joi.object({
  labourId: Joi.string().required(),
  date: Joi.date().required(),
  status: Joi.string().valid('PRESENT', 'ABSENT', 'HALF_DAY').required(),
  overtime: Joi.number().min(0).default(0),
  projectId: Joi.string().allow(null),
});

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { error } = attendanceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { labourId, date, status, overtime, projectId } = req.body;
    
    // UPSERT attendance
    const attendance = await prisma.labourAttendance.upsert({
      where: {
        labourId_date: {
          labourId,
          date: new Date(date)
        }
      },
      update: {
        status,
        overtime,
        projectId
      },
      create: {
        labourId,
        date: new Date(date),
        status,
        overtime,
        projectId
      }
    });

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};
