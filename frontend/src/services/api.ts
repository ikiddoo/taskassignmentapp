import axios from 'axios';
import type { CreateTaskInput } from '../types';

// Use /api for Docker deployment (nginx proxy), fallback to localhost:3000 for local development
// When running on Docker (port 80 or empty port), use /api
// When running locally (port 5173 or 5174 from Vite), use http://localhost:3000
const isDevelopment = window.location.port && window.location.port !== '80' && window.location.port !== '443';
const API_BASE_URL = import.meta.env.VITE_API_URL || (isDevelopment ? 'http://localhost:3000' : '/api');

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  async getTasks() {
    const response = await axiosInstance.get('/tasks');
    return response.data;
  },

  async createTask(data: CreateTaskInput) {
    try {
      const response = await axiosInstance.post('/tasks', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create task');
    }
  },

  async updateTask(id: number, data: any) {
    try {
      const response = await axiosInstance.patch(`/tasks/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  async getDevelopers() {
    const response = await axiosInstance.get('/developers');
    return response.data;
  },

  async getSkills() {
    const response = await axiosInstance.get('/skills');
    return response.data;
  },
};
