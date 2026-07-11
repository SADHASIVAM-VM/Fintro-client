import type { AxiosResponse } from 'axios';
import { mockUsers, getDashboardData } from './mockData';

// Maintain a mutable list of users in-memory to support additions, edits, deletions
let localUsers = [...mockUsers];

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

  // 8. NOT FOUND
  return Promise.reject({
    response: {
      status: 404,
      data: { message: `Route ${method} ${url} not found in client mock database.` },
    },
  });
};
