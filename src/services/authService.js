import axiosClient from './axiosClient';

const authService = {
  login: async (email, password) => {
    try {
      const response = await axiosClient.post('/users/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario_actual', JSON.stringify(response.data.user)); // Still needed for context for now
      }
      return response.data;
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosClient.post('/users/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario_actual', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error in register:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_actual');
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('usuario_actual'));
  }
};

export default authService;
