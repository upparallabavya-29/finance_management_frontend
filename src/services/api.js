import axios from 'axios'

let API_URL = import.meta.env.VITE_API_URL || '/api';

try {
    if (API_URL.startsWith('http')) {
        const urlObj = new URL(API_URL);
        // If the path is exactly '/' or empty, assume it needs '/api'
        if (urlObj.pathname === '/' || urlObj.pathname === '') {
            urlObj.pathname = '/api';
            API_URL = urlObj.toString().replace(/\/$/, '');
        } else {
            // Remove trailing slash for consistency
            API_URL = API_URL.replace(/\/$/, '');
        }
    }
} catch (error) {
    console.warn('Invalid VITE_API_URL format:', error);
}

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Attach token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me')
}

export const transactionService = {
    getTransactions: () => api.get('/transactions'),
    createTransaction: (data) => api.post('/transactions', data),
    updateTransaction: (id, data) => api.put(`/transactions/${id}`, data),
    deleteTransaction: (id) => api.delete(`/transactions/${id}`)
}

export const budgetService = {
    getBudgets: () => api.get('/budgets'),
    createBudget: (data) => api.post('/budgets', data),
    updateBudget: (id, data) => api.put(`/budgets/${id}`, data),
    deleteBudget: (id) => api.delete(`/budgets/${id}`)
}

export const savingsService = {
    getGoals: () => api.get('/goals'),
    createGoal: (data) => api.post('/goals', data),
    updateGoal: (id, data) => api.put(`/goals/${id}`, data),
    deleteGoal: (id) => api.delete(`/goals/${id}`)
}

export const billService = {
    getBills: () => api.get('/bills'),
    createBill: (data) => api.post('/bills', data),
    updateBill: (id, data) => api.put(`/bills/${id}`, data),
    deleteBill: (id) => api.delete(`/bills/${id}`)
}

export const debtService = {
    getDebts: () => api.get('/debts'),
    createDebt: (data) => api.post('/debts', data),
    updateDebt: (id, data) => api.put(`/debts/${id}`, data),
    deleteDebt: (id) => api.delete(`/debts/${id}`)
}


export const insightService = {
    getOverview: () => api.get('/insights')
}

export const categoryService = {
    getCategories: () => api.get('/categories'),
    createCategory: (data) => api.post('/categories', data),
    updateCategory: (id, data) => api.put(`/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/categories/${id}`)
}

export default api
