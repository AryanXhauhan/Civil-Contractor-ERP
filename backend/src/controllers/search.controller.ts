import { Request, Response } from 'express';
import { prisma } from '../index';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim() === '') {
      return res.json({ projects: [], clients: [], vendors: [], materials: [] });
    }

    const searchTerm = q.trim();

    // Search Projects
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { location: { contains: searchTerm, mode: 'insensitive' } },
        ]
      },
      select: { id: true, name: true, status: true },
      take: 5
    });

    // Search Clients
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { company: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ]
      },
      select: { id: true, name: true, company: true },
      take: 5
    });

    // Search Vendors
    const vendors = await prisma.vendor.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { company: { contains: searchTerm, mode: 'insensitive' } },
        ]
      },
      select: { id: true, name: true, company: true },
      take: 5
    });

    // Search Materials
    const materials = await prisma.material.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { category: { contains: searchTerm, mode: 'insensitive' } },
        ]
      },
      select: { id: true, name: true, category: true, currentStock: true, unit: true },
      take: 5
    });

    res.json({
      projects,
      clients,
      vendors,
      materials
    });
  } catch (error) {
    console.error('Error in global search:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
};
