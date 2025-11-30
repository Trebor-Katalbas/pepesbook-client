import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      
      login: (user) => set({ 
        currentUser: user, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        currentUser: null, 
        isAuthenticated: false 
      }),

      updateUser: (user) => set((state) => ({
        currentUser: state.currentUser?.id === user.id ? user : state.currentUser
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);