import type { User } from '@/features/auth/authSlice';

// Helper to generate mock users
const roles: ('admin' | 'user')[] = ['admin', 'user'];
export const mockUsers: User[] = Array.from({ length: 28 }).map((_, i) => ({
  id: `usr-${i + 1}`,
  name: [
    'Alice Smith', 'Bob Jones', 'Charlie Brown', 'Diana Prince', 'Evan Wright',
    'Fiona Gallagher', 'George Costanza', 'Helen Mirren', 'Ian McKellen', 'Julia Roberts',
    'Kevin Bacon', 'Laura Croft', 'Michael Scott', 'Natalie Portman', 'Oscar Wilde',
    'Penelope Cruz', 'Quentin Tarantino', 'Rachel Green', 'Steve Rogers', 'Tony Stark',
    'Ursula Buffay', 'Victor Frankenstein', 'Wanda Maximoff', 'Xavier Hernandez', 'Yvonne Strahovski',
    'Zachary Levi', 'Arthur Dent', 'Ford Prefect'
  ][i] || `User ${i + 1}`,
  email: [
    'alice@example.com', 'bob@example.com', 'charlie@example.com', 'diana@example.com', 'evan@example.com',
    'fiona@example.com', 'george@example.com', 'helen@example.com', 'ian@example.com', 'julia@example.com',
    'kevin@example.com', 'laura@example.com', 'michael@example.com', 'natalie@example.com', 'oscar@example.com',
    'penelope@example.com', 'quentin@example.com', 'rachel@example.com', 'steve@example.com', 'tony@example.com',
    'ursula@example.com', 'victor@example.com', 'wanda@example.com', 'xavier@example.com', 'yvonne@example.com',
    'zachary@example.com', 'arthur@example.com', 'ford@example.com'
  ][i] || `user${i + 1}@example.com`,
  role: i === 0 || i === 19 ? 'admin' : roles[i % 2],
  avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
    [
      'Alice', 'Bob', 'Charlie', 'Diana', 'Evan', 'Fiona', 'George', 'Helen', 'Ian', 'Julia',
      'Kevin', 'Laura', 'Michael', 'Natalie', 'Oscar', 'Penelope', 'Quentin', 'Rachel', 'Steve', 'Tony'
    ][i % 20] || `User${i}`
  )}`,
}));

export const getDashboardData = () => ({
  stats: {
    todayExpense: { value: 250 },
    monthlyExpense: { value: 4300 },
    income: { value: 12000 },
    savings: { value: 7700 },
    remainingBudget: { value: 700 },
    upcomingEmi: { value: 1500 },
    borrowedOutstanding: { value: 2000 },
    lentOutstanding: { value: 1000 },
    roomRentStatus: { value: 'Pending' },
    roomBillsStatus: { value: 'Pending Dues' },
  },
  charts: {
    expenseCategory: [
      { name: 'Food', value: 1200, color: '#EF4444' },
      { name: 'Grocery', value: 800, color: '#10B981' },
      { name: 'Zepto', value: 500, color: '#A855F7' },
      { name: 'Travel', color: '#06B6D4', value: 600 },
    ],
    monthlyTrend: [
      { name: 'Jan', value: 2200, income: 5000, savings: 2800 },
      { name: 'Feb', value: 3100, income: 5000, savings: 1900 },
      { name: 'Mar', value: 1800, income: 6000, savings: 4200 },
      { name: 'Apr', value: 2900, income: 6000, savings: 3100 },
      { name: 'May', value: 4300, income: 12000, savings: 7700 },
    ],
  },
  recentActivity: {
    expenses: [
      { _id: 'e1', title: 'Zepto order', amount: 350, date: '2026-07-05' },
      { _id: 'e2', title: 'Swiggy Dinner', amount: 480, date: '2026-07-04' },
    ],
    roomPurchases: [
      { _id: 'rp1', name: 'Gas Refill', price: 950, category: 'gas' },
    ],
  },
});
