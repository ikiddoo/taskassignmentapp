import axios from 'axios';
import type { CreateTaskInput } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
