import { Request, Response } from 'express';
import { prisma } from '../index';

// Get overall stats
export const getStats = async (req: Request, res: Response) => {
  try {
    // Get total users
    const totalUsers = await prisma.user.count();

    // Get total transactions
    const totalTransactions = await prisma.transaction.count();

    // Get total volume
    const volumeResult = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      }
    });
    const totalVolume = volumeResult._sum.amount || 0;

    // Get total fees
    const feesResult = await prisma.transaction.aggregate({
      _sum: {
        fee: true
      }
    });
    const totalFees = feesResult._sum.fee || 0;

    // Get new users in last 24 hours
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    // Get transactions in last 24 hours
    const newTransactions = await prisma.transaction.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    res.status(200).json({
      totalUsers,
      totalTransactions,
      totalVolume,
      totalFees,
      newUsers,
      newTransactions
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
};

// Get daily stats
export const getDailyStats = async (req: Request, res: Response) => {
  try {
    const { days = '7' } = req.query;
    const daysCount = parseInt(days as string);
    
    // Get stats for each day
    const stats = [];
    
    for (let i = 0; i < daysCount; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      // Get users created on this day
      const newUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      });
      
      // Get transactions on this day
      const transactions = await prisma.transaction.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      });
      
      // Get volume on this day
      const volumeResult = await prisma.transaction.aggregate({
        _sum: {
          amount: true
        },
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      });
      
      // Get fees on this day
      const feesResult = await prisma.transaction.aggregate({
        _sum: {
          fee: true
        },
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      });
      
      stats.push({
        date: date.toISOString().split('T')[0],
        newUsers,
        transactions,
        volume: volumeResult._sum.amount || 0,
        fees: feesResult._sum.fee || 0
      });
    }
    
    res.status(200).json(stats.reverse());
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ message: 'Failed to fetch daily stats' });
  }
};

// Get user growth
export const getUserGrowth = async (req: Request, res: Response) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFormat: string;
    let groupBy: any;
    
    // Set date format and group by based on period
    if (period === 'day') {
      dateFormat = '%Y-%m-%d';
      groupBy = {
        year: { extract: 'year', from: 'createdAt' },
        month: { extract: 'month', from: 'createdAt' },
        day: { extract: 'day', from: 'createdAt' }
      };
    } else if (period === 'week') {
      dateFormat = '%Y-%U';
      groupBy = {
        year: { extract: 'year', from: 'createdAt' },
        week: { extract: 'week', from: 'createdAt' }
      };
    } else {
      dateFormat = '%Y-%m';
      groupBy = {
        year: { extract: 'year', from: 'createdAt' },
        month: { extract: 'month', from: 'createdAt' }
      };
    }
    
    // This is a simplified version since Prisma doesn't support direct date formatting
    // In a real implementation, you would use raw SQL or a more complex query
    const users = await prisma.user.findMany({
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Process the data to group by period
    const groupedData: Record<string, number> = {};
    
    users.forEach(user => {
      let key: string;
      const date = new Date(user.createdAt);
      
      if (period === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'week') {
        const weekNumber = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
        key = `${date.getFullYear()}-W${weekNumber}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      groupedData[key] = (groupedData[key] || 0) + 1;
    });
    
    // Convert to array format
    const result = Object.entries(groupedData).map(([date, count]) => ({
      date,
      count
    }));
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching user growth:', error);
    res.status(500).json({ message: 'Failed to fetch user growth' });
  }
};

// Get transaction volume
export const getTransactionVolume = async (req: Request, res: Response) => {
  try {
    const { period = 'month' } = req.query;
    
    // This is a simplified version since Prisma doesn't support direct date formatting
    // In a real implementation, you would use raw SQL or a more complex query
    const transactions = await prisma.transaction.findMany({
      select: {
        createdAt: true,
        amount: true,
        fee: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Process the data to group by period
    const groupedData: Record<string, { volume: number, fees: number }> = {};
    
    transactions.forEach(tx => {
      let key: string;
      const date = new Date(tx.createdAt);
      
      if (period === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'week') {
        const weekNumber = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
        key = `${date.getFullYear()}-W${weekNumber}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!groupedData[key]) {
        groupedData[key] = { volume: 0, fees: 0 };
      }
      
      groupedData[key].volume += tx.amount;
      groupedData[key].fees += tx.fee;
    });
    
    // Convert to array format
    const result = Object.entries(groupedData).map(([date, data]) => ({
      date,
      volume: data.volume,
      fees: data.fees
    }));
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching transaction volume:', error);
    res.status(500).json({ message: 'Failed to fetch transaction volume' });
  }
};