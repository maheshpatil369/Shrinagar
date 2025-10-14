// /Frontend1/src/lib/api.ts
// This file has been updated to use a named export to resolve the module error.

import axios from 'axios';

// Using a named export for the api instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

