import { create } from 'zustand';
import { apiClient } from '../utils/apiClient';

export const useUserStore = create((set, get) => ({
  users: {},

  setUser: (user) => set((state) => ({
    users: {
      ...state.users,
      [user.id]: user
    }
  })),

  fetchUser: async (userId) => {
    try {
      const user = await apiClient(`/users/${userId}`);
      get().setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const user = await apiClient('/users/', {
        method: 'POST',
        body: userData
      });
      get().setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const updatedUser = await apiClient(`/users/${userId}`, {
        method: 'PUT',
        body: userData
      });
      
      get().setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  },

  updateProfilePicture: async (userId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profile_pic', imageFile);

      const updatedUser = await apiClient(`/users/${userId}/profile-picture`, {
        method: 'PUT',
        body: formData,
      });
      
      get().setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  },

  // Getters
  getUserById: (userId) => get().users[userId],
}));