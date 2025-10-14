const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  async getTasks() {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  async updateTask(id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
    return response.json();
  },

  async getDevelopers() {
    const response = await fetch(`${API_BASE_URL}/developers`);
    if (!response.ok) throw new Error('Failed to fetch developers');
    return response.json();
  },

  async getSkills() {
    const response = await fetch(`${API_BASE_URL}/skills`);
    if (!response.ok) throw new Error('Failed to fetch skills');
    return response.json();
  },
};
