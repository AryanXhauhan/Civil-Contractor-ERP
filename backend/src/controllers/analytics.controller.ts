import { Request, Response } from 'express';
import { prisma } from '../index';

// Dashboard Overview (Total Projects, Contract Value, etc.)
export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    const totalProjects = await prisma.project.count();
    
    const projects = await prisma.project.findMany({
      select: { contractValue: true }
    });
    const totalContractValue = projects.reduce((acc, curr) => acc + (curr.contractValue || 0), 0);

    const invoices = await prisma.invoice.findMany({
      where: { status: { in: ['SENT', 'OVERDUE'] } }
    });
    const pendingPayments = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0);

    const lowStockMaterials = await prisma.material.count({
      where: {
        currentStock: {
          lte: prisma.material.fields.minThreshold
        }
      }
    });

    res.json({
      totalProjects,
      totalContractValue,
      pendingPayments,
      lowStockMaterials
    });
  } catch (error) {
    console.error('Error in getDashboardOverview:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
};

// Project Profitability (Estimated vs Actual)
export const getProjectProfitability = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        boqItems: true,
        expenses: true,
        invoices: {
          where: { status: 'PAID' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Estimated Cost = sum of BOQ estimated costs
    const estimatedCost = project.boqItems.reduce((acc, item) => acc + ((item.estimatedQty || 0) * (item.rate || 0)), 0);

    // Actual Cost = sum of all expenses
    const actualCost = project.expenses.reduce((acc, exp) => acc + exp.amount, 0);

    // Revenue = sum of paid invoices
    const revenue = project.invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);

    const estimatedMargin = project.contractValue - estimatedCost;
    const actualMargin = revenue - actualCost; // OR contractValue - actualCost depending on accounting standard

    res.json({
      projectId: project.id,
      projectName: project.name,
      contractValue: project.contractValue,
      estimatedCost,
      actualCost,
      revenue,
      estimatedMargin,
      actualMargin,
      profitabilityPercentage: actualCost > 0 ? ((revenue - actualCost) / revenue) * 100 : 0
    });
  } catch (error) {
    console.error('Error in getProjectProfitability:', error);
    res.status(500).json({ error: 'Failed to fetch project profitability' });
  }
};

// Cash Flow (Monthly Expenses vs Income)
export const getCashFlow = async (req: Request, res: Response) => {
  try {
    // Basic implementation: grouping expenses and payments by month for the current year
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const payments = await prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Initialize months array (0-11)
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }),
      income: 0,
      expense: 0
    }));

    // Aggregate expenses
    expenses.forEach(exp => {
      const monthIndex = new Date(exp.date).getMonth();
      monthlyData[monthIndex].expense += exp.amount;
    });

    // Aggregate income
    payments.forEach(pay => {
      const monthIndex = new Date(pay.createdAt).getMonth();
      monthlyData[monthIndex].income += pay.amount;
    });

    res.json(monthlyData);
  } catch (error) {
    console.error('Error in getCashFlow:', error);
    res.status(500).json({ error: 'Failed to fetch cash flow data' });
  }
};
