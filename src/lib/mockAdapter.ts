import type { AxiosResponse } from 'axios';
import { mockUsers, getDashboardData } from './mockData';

// Maintain a mutable list of users in-memory to support additions, edits, deletions
let localUsers = [...mockUsers];
let localAccounts: any[] = [
  {
    _id: 'acc-1',
    name: 'HDFC Salary Bank',
    type: 'bank_account',
    institution: 'HDFC Bank',
    accountIdentifier: 'XXXX-4921',
    openingBalance: 18500,
    currentBalance: 18500,
    currency: 'INR',
    isActive: true,
  },
  {
    _id: 'acc-2',
    name: 'Personal Cash',
    type: 'cash',
    institution: 'Cash Wallet',
    accountIdentifier: '',
    openingBalance: 2000,
    currentBalance: 2000,
    currency: 'INR',
    isActive: true,
  },
];
let localTransactions: any[] = [];
let localSubscriptions: any[] = [
  {
    _id: 'sub-1',
    name: 'Netflix Premium 4K',
    cost: 649,
    billingCycle: 'monthly',
    nextBillingDate: '2026-09-25',
    status: 'active',
    priceHistory: [{ amount: 649, changedAt: '2026-01-01' }],
  },
  {
    _id: 'sub-2',
    name: 'Spotify Family',
    cost: 179,
    billingCycle: 'monthly',
    nextBillingDate: '2026-09-18',
    status: 'active',
    priceHistory: [{ amount: 179, changedAt: '2026-01-01' }],
  },
];
let localRecurring: any[] = [
  {
    _id: 'rec-1',
    name: 'Monthly Apartment Rent',
    amount: 12000,
    type: 'EXPENSE',
    frequency: 'monthly',
    startDate: '2026-01-01',
    nextOccurrence: '2026-10-01',
    isActive: true,
  },
];
let localInbox: any[] = [
  {
    _id: 'inbox-1',
    fileUrl: '/uploads/swiggy_receipt.png',
    originalFilename: 'swiggy_dinner.png',
    ocrStatus: 'COMPLETED',
    ocrText: '[OCR PROCESSED]\nMerchant: Swiggy\nTotal: ₹348\nDate: 2026-09-13',
    extractedData: {
      merchant: 'Swiggy',
      amount: 348,
      date: '2026-09-13',
      tax: 17,
      invoiceNumber: 'INV-784912',
    },
    confidence: 0.95,
    isConfirmed: false,
    isDuplicate: false,
    createdAt: new Date().toISOString(),
  },
];

export const mockAdapter = async (config: any): Promise<AxiosResponse<any>> => {
  const url = config.url || '';
  const method = (config.method || 'GET').toUpperCase();
  const params = config.params || {};
  
  let data: any = null;
  if (config.data) {
    try {
      data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      data = config.data;
    }
  }

  // Simulate network latency (300ms)
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 1. LOGIN
  if (url.endsWith('/auth/login') && method === 'POST') {
    const { email, password } = data || {};
    if (email === 'admin@example.com' && password === 'admin123') {
      const user = localUsers.find((u) => u.role === 'admin') || localUsers[0];
      return {
        data: {
          user,
          token: 'mock-jwt-access-token-admin',
          refreshToken: 'mock-jwt-refresh-token-admin',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }
    
    // Check general password
    const user = localUsers.find((u) => u.email === email);
    if (user && password === 'password123') {
      return {
        data: {
          user,
          token: `mock-jwt-access-token-${user.id}`,
          refreshToken: `mock-jwt-refresh-token-${user.id}`,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    return Promise.reject({
      response: {
        status: 400,
        data: { message: 'Invalid credentials. Use admin@example.com / admin123 or user email / password123' },
      },
    });
  }

  // 2. REGISTER
  if (url.endsWith('/auth/register') && method === 'POST') {
    const { name, email } = data || {};
    if (!email || !name) {
      return Promise.reject({
        response: {
          status: 400,
          data: { message: 'Name and email are required.' },
        },
      });
    }

    const newUser = {
      id: `usr-${localUsers.length + 1}`,
      name,
      email,
      role: 'user' as const,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    };
    localUsers.unshift(newUser);

    return {
      data: {
        user: newUser,
        token: `mock-jwt-access-token-${newUser.id}`,
        refreshToken: `mock-jwt-refresh-token-${newUser.id}`,
      },
      status: 201,
      statusText: 'Created',
      headers: {},
      config,
    };
  }

  // 3. REFRESH TOKEN
  if (url.endsWith('/auth/refresh') && method === 'POST') {
    return {
      data: {
        user: localUsers[0],
        token: 'mock-jwt-access-token-refreshed-' + Math.random(),
        refreshToken: 'mock-jwt-refresh-token-refreshed',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 4. PROFILE
  if (url.endsWith('/auth/profile') && method === 'GET') {
    return {
      data: localUsers[0],
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 5. GET USERS (Query pagination, filtering, searching, sorting)
  if (url.endsWith('/users') && method === 'GET') {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const search = params.search || '';
    const sortBy = params.sortBy || 'name';
    const sortOrder = params.sortOrder || 'asc';
    const role = params.role || '';

    let filtered = [...localUsers];

    // Searching
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }

    // Role filtering
    if (role) {
      filtered = filtered.filter((u) => u.role === role);
    }

    // Sorting
    filtered.sort((a: any, b: any) => {
      const valA = a[sortBy] || '';
      const valB = b[sortBy] || '';
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      data: {
        data: paginated,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 6. SINGLE USER CRUD (GET /users/:id, PATCH /users/:id, DELETE /users/:id)
  const userMatch = url.match(/\/users\/([a-zA-Z0-9-]+)$/);
  if (userMatch) {
    const userId = userMatch[1];

    if (method === 'GET') {
      const user = localUsers.find((u) => u.id === userId);
      if (user) {
        return { data: user, status: 200, statusText: 'OK', headers: {}, config };
      }
      return Promise.reject({
        response: { status: 404, data: { message: 'User not found' } },
      });
    }

    if (method === 'PATCH') {
      const userIndex = localUsers.findIndex((u) => u.id === userId);
      if (userIndex !== -1) {
        localUsers[userIndex] = { ...localUsers[userIndex], ...data };
        return {
          data: localUsers[userIndex],
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }
      return Promise.reject({
        response: { status: 404, data: { message: 'User not found' } },
      });
    }

    if (method === 'DELETE') {
      localUsers = localUsers.filter((u) => u.id !== userId);
      return {
        data: { success: true, id: userId },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }
  }

  // CREATE USER (POST /users)
  if (url.endsWith('/users') && method === 'POST') {
    const { name, email, role } = data || {};
    if (!name || !email) {
      return Promise.reject({
        response: { status: 400, data: { message: 'Name and email are required.' } },
      });
    }

    const newUser = {
      id: `usr-${localUsers.length + 1}`,
      name,
      email,
      role: role || 'user',
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    };
    localUsers.unshift(newUser);

    return {
      data: newUser,
      status: 201,
      statusText: 'Created',
      headers: {},
      config,
    };
  }

  // 7. DASHBOARD DATA (GET /dashboard)
  if (url.endsWith('/dashboard') && method === 'GET') {
    return {
      data: getDashboardData(),
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 8. ACCOUNTS HANDLERS
  if ((url.endsWith('/accounts') || url.endsWith('/account')) && method === 'GET') {
    return {
      data: {
        success: true,
        data: localAccounts.filter((a) => a.isActive),
        meta: {
          totalAccounts: localAccounts.filter((a) => a.isActive).length,
          totalBalance: localAccounts.filter((a) => a.isActive).reduce((sum, a) => sum + (a.currentBalance || 0), 0),
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  if ((url.endsWith('/accounts') || url.endsWith('/account')) && method === 'POST') {
    const newAcc = {
      _id: `acc-${Date.now()}`,
      name: data.name,
      type: data.type,
      institution: data.institution || '',
      accountIdentifier: data.accountIdentifier || '',
      openingBalance: Number(data.openingBalance) || 0,
      currentBalance: Number(data.openingBalance) || 0,
      currency: data.currency || 'INR',
      isActive: true,
    };
    localAccounts.unshift(newAcc);
    return {
      data: {
        success: true,
        message: 'Account created successfully',
        data: newAcc,
      },
      status: 201,
      statusText: 'Created',
      headers: {},
      config,
    };
  }

  if (url.includes('/accounts/') && method === 'PUT') {
    const accId = url.split('/accounts/')[1];
    const acc = localAccounts.find((a) => a._id === accId);
    if (acc) {
      Object.assign(acc, data);
    }
    return {
      data: { success: true, data: acc },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  if (url.includes('/accounts/') && method === 'DELETE') {
    const accId = url.split('/accounts/')[1];
    localAccounts = localAccounts.filter((a) => a._id !== accId);
    return {
      data: { success: true, message: 'Account archived' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 9. TRANSACTIONS HANDLERS
  if (url.endsWith('/transactions') && method === 'GET') {
    return {
      data: {
        success: true,
        meta: { page: 1, limit: 10, total: localTransactions.length, totalPages: 1 },
        data: localTransactions,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  if (url.endsWith('/transactions') && method === 'POST') {
    const newTx = {
      _id: `tx-${Date.now()}`,
      ...data,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };
    localTransactions.unshift(newTx);

    const acc = localAccounts.find((a) => a._id === data.accountId);
    if (acc) {
      if (['EXPENSE', 'LEND', 'EMI_PAYMENT'].includes(data.type)) {
        acc.currentBalance -= Number(data.amount);
      } else if (['INCOME', 'BORROW', 'REFUND'].includes(data.type)) {
        acc.currentBalance += Number(data.amount);
      } else if (data.type === 'TRANSFER') {
        acc.currentBalance -= Number(data.amount);
        const dest = localAccounts.find((a) => a._id === data.destinationAccountId);
        if (dest) dest.currentBalance += Number(data.amount);
      }
    }

    return {
      data: { success: true, data: newTx },
      status: 201,
      statusText: 'Created',
      headers: {},
      config,
    };
  }

  // 10. SUBSCRIPTIONS HANDLERS
  if (url.endsWith('/subscriptions') && method === 'GET') {
    const monthlyCost = localSubscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + (s.billingCycle === 'yearly' ? s.cost / 12 : s.cost), 0);
    return {
      data: {
        success: true,
        data: localSubscriptions,
        meta: {
          totalMonthlyCost: monthlyCost,
          totalAnnualCost: monthlyCost * 12,
          activeSubscriptionsCount: localSubscriptions.filter((s) => s.status === 'active').length,
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  if (url.endsWith('/subscriptions') && method === 'POST') {
    const newSub = {
      _id: `sub-${Date.now()}`,
      name: data.name,
      cost: Number(data.cost),
      billingCycle: data.billingCycle || 'monthly',
      nextBillingDate: data.nextBillingDate,
      status: 'active',
      priceHistory: [{ amount: Number(data.cost), changedAt: new Date().toISOString() }],
    };
    localSubscriptions.unshift(newSub);
    return {
      data: { success: true, data: newSub },
      status: 201,
      statusText: 'Created',
      headers: {},
      config,
    };
  }

  // 11. RECURRING HANDLERS
  if (url.endsWith('/recurring') && method === 'GET') {
    return {
      data: {
        success: true,
        data: localRecurring.filter((r) => r.isActive),
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 12. PLANNING HANDLER
  if ((url.includes('/planning') || url.endsWith('/planning/metrics')) && method === 'GET') {
    const totalAvail = localAccounts.filter((a) => a.isActive).reduce((sum, a) => sum + (a.currentBalance || 0), 0);
    return {
      data: {
        success: true,
        data: {
          totalAvailableBalance: totalAvail,
          safeToSpend: Math.max(0, totalAvail - 11500),
          upcomingObligations: 11500,
          savingsCommitmentMonthly: 2000,
          emergencyFund: {
            currentSaved: 62000,
            essentialMonthlyExpenses: 25000,
            runwayMonths: 2.48,
            targetRunwayMonths: 6,
          },
          cashFlowForecast: {
            day7: Math.round(totalAvail - 2500),
            day30: Math.round(totalAvail - 11500),
            day90: Math.round(totalAvail - 34500),
          },
          financialHealthScore: {
            score: 78,
            rating: 'Good',
          },
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 13. INSIGHTS HANDLERS
  if (url.includes('/insights/parse-natural') && method === 'POST') {
    return {
      data: {
        success: true,
        message: 'Natural language text parsed successfully',
        data: {
          type: 'EXPENSE',
          amount: 450,
          merchant: 'Saravana Bhavan',
          category: 'Food',
          date: new Date().toISOString().split('T')[0],
          notes: 'Parsed from natural language input',
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  if (url.includes('/insights') && method === 'GET') {
    return {
      data: {
        success: true,
        data: {
          insights: [
            { type: 'WARNING', title: 'High Food Expenses', message: 'You spent 35% more on food this month.' },
            { type: 'INFO', title: 'Subscription Renewal', message: 'Netflix renews in 12 days.' },
          ],
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 14. INBOX HANDLERS
  if ((url.endsWith('/inbox') || url.includes('/inbox')) && method === 'GET') {
    return {
      data: {
        success: true,
        meta: { totalDrafts: localInbox.filter((i) => !i.isConfirmed).length },
        data: localInbox.filter((i) => !i.isConfirmed),
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  if (url.includes('/inbox/upload') && method === 'POST') {
    const newItem = {
      _id: `inbox-${Date.now()}`,
      fileUrl: '/uploads/receipt_sample.png',
      originalFilename: 'Uploaded_Receipt.png',
      ocrStatus: 'COMPLETED',
      ocrText: '[OCR PROCESSED]\nMerchant: Swiggy Food\nTotal: ₹450\nDate: 2026-09-13',
      extractedData: {
        merchant: 'Swiggy Food',
        amount: 450,
        date: '2026-09-13',
        tax: 22,
        invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      },
      confidence: 0.95,
      isConfirmed: false,
      createdAt: new Date().toISOString(),
    };
    localInbox.unshift(newItem);
    return {
      data: { success: true, message: 'Receipt uploaded to Financial Inbox', data: newItem },
      status: 201,
      statusText: 'Created',
      headers: {},
      config,
    };
  }

  if (url.includes('/inbox/') && url.includes('/confirm') && method === 'POST') {
    const itemId = url.split('/inbox/')[1].split('/confirm')[0];
    const item = localInbox.find((i) => i._id === itemId);
    if (item) {
      item.isConfirmed = true;
    }
    return {
      data: { success: true, message: 'Transaction confirmed from Financial Inbox' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  if (url.includes('/inbox/') && method === 'DELETE') {
    const itemId = url.split('/inbox/')[1];
    localInbox = localInbox.filter((i) => i._id !== itemId);
    return {
      data: { success: true, message: 'Draft removed from Financial Inbox' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 15. NOT FOUND
  return Promise.reject({
    response: {
      status: 404,
      data: { message: `Route ${method} ${url} not found in client mock database.` },
    },
  });
};
