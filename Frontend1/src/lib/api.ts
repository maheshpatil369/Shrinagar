import { z } from 'zod';

// Validation schemas
export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
  role: z.enum(['buyer', 'seller', 'admin'], { required_error: "Please select a role" }),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;

// Mock API base URL (simulating backend)
const API_BASE_URL = 'http://localhost:8000/api';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API calls (frontend-only simulation)
export const api = {
  register: async (data: SignupData) => {
    await delay(500); // Simulate network delay
    
    // Store in localStorage (simulating database)
    const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
    
    // Check if email already exists
    if (users.find((u: any) => u.email === data.email)) {
      throw new Error('Email already registered');
    }
    
    const newUser = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password, // In real app, this would be hashed
      role: data.role,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(users));
    
    // Return mock response (simulating backend response)
    return {
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };
  },

  login: async (data: LoginData) => {
    await delay(500); // Simulate network delay
    
    // Check registered users first
    const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const user = users.find((u: any) => u.email === data.email && u.password === data.password);
    
    if (user) {
      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }
    
    // Check demo credentials
    const DEMO_USERS = {
      buyer: { email: 'buyer@demo.com', password: 'demo123', name: 'John Buyer', role: 'buyer' },
      seller: { email: 'seller@demo.com', password: 'demo123', name: 'Jane Seller', role: 'seller' },
      admin: { email: 'admin@demo.com', password: 'demo123', name: 'Admin User', role: 'admin' },
    };
    
    const demoUser = Object.values(DEMO_USERS).find(
      (u) => u.email === data.email && u.password === data.password
    );
    
    if (demoUser) {
      return {
        success: true,
        message: 'Login successful',
        user: {
          id: `demo_${demoUser.role}`,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
        },
      };
    }
    
    throw new Error('Invalid email or password');
  },

  logout: async () => {
    await delay(300);
    return { success: true, message: 'Logged out successfully' };
  },
};

// Log API endpoint info (for demonstration)
console.log(`🔗 API Base URL: ${API_BASE_URL}`);
console.log('📝 Mock endpoints:');
console.log(`   POST ${API_BASE_URL}/auth/register`);
console.log(`   POST ${API_BASE_URL}/auth/login`);
console.log(`   POST ${API_BASE_URL}/auth/logout`);
