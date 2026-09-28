import { Request, Response } from 'express';
import { prisma } from '../index';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId },
          { userId: null } // System-wide notifications
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Verify ownership
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || (notification.userId && notification.userId !== userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
};

// Internal utility function to create a notification (not a route handler)
export const createNotification = async (title: string, message: string, userId?: string) => {
  try {
    await prisma.notification.create({
      data: {
        title,
        message,
        userId: userId || null
      }
    });
  } catch (error) {
    console.error('Failed to create notification inside system:', error);
  }
};
