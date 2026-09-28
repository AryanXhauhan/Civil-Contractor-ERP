import { Request, Response } from 'express';
import { prisma } from '../index';
import Joi from 'joi';

const projectSchema = Joi.object({
  name: Joi.string().required(),
  clientId: Joi.string().allow('', null),
  clientName: Joi.string().allow('', null),
  location: Joi.string().allow('', null),
  type: Joi.string().allow('', null),
  contractValue: Joi.number().min(0).default(0),
  startDate: Joi.date().allow(null),
  expectedEndDate: Joi.date().allow(null),
  status: Joi.string().valid('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'),
  description: Joi.string().allow('', null),
}).or('clientId', 'clientName');

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        client: {
          select: { id: true, name: true, company: true }
        },
        _count: {
          select: { members: true, boqItems: true, expenses: true, dailyReports: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } }
        },
        creator: { select: { id: true, firstName: true, lastName: true } },
        boqItems: true,
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { error } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    let finalClientId = req.body.clientId;

    // If no clientId but clientName is provided, find or create the client
    if (!finalClientId && req.body.clientName) {
      let client = await prisma.client.findFirst({
        where: {
          name: {
            equals: req.body.clientName,
            mode: 'insensitive'
          }
        }
      });

      if (!client) {
        client = await prisma.client.create({
          data: { name: req.body.clientName }
        });
      }
      finalClientId = client.id;
    }

    const { clientName, clientId, ...projectData } = req.body;

    const project = await prisma.project.create({
      data: {
        ...projectData,
        clientId: finalClientId,
        creatorId: req.user!.userId
      }
    });

    // Add creator as project member with PROJECT_MANAGER role by default
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: req.user!.userId,
        role: 'PROJECT_MANAGER'
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const project = await prisma.project.update({
      where: { id },
      data: req.body
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({
      where: { id }
    });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

// Add a member to a project
export const addProjectMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'UserId and Role are required' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId,
        role
      }
    });

    res.status(201).json(member);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'User is already a member of this project' });
    }
    res.status(500).json({ error: 'Failed to add project member' });
  }
};
