import { Request, Response } from 'express';
import { prisma } from '../index';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { entity, entityId, limit = 50, offset = 0 } = req.query;

    const where: any = {};
    if (entity) where.entity = String(entity);
    if (entityId) where.entityId = String(entityId);

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true, role: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });

    const total = await prisma.auditLog.count({ where });

    res.json({ logs, total });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

// Internal utility to log an action
export const createAuditLog = async (userId: string, action: string, entity: string, entityId?: string, metadata?: any) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
      }
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
