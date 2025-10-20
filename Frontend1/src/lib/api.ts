// /Frontend1/src/lib/api.ts
import axios from 'axios';

// CORRECTED: baseURL should be relative so the proxy can catch it.
// The Vite proxy will now correctly handle requests starting with /api.
export const api = axios.create({
  baseURL: '/api',
});
