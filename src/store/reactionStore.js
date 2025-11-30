import { create } from 'zustand';
import { apiClient } from '../utils/apiClient';
import { useAuthStore } from './authStore';

export const useReactionStore = create((set, get) => ({
  reactions: {},

  setReactions: (postId, reactions) => set((state) => ({
    reactions: {
      ...state.reactions,
      [postId]: reactions
    }
  })),

  fetchReactions: async (postId) => {
    try {
      const reactions = await apiClient(`/reactions/${postId}`);
      get().setReactions(postId, reactions);
    } catch (error) {
      throw error;
    }
  },

  addReaction: async (postId, type) => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const reactionData = {
        post_id: postId,
        user_id: currentUser.id,
        type
      };

      const newReaction = await apiClient('/reactions/', {
        method: 'POST',
        body: reactionData,
      });

      set((state) => {
        const currentReactions = state.reactions[postId] || [];
        const filteredReactions = currentReactions.filter(
          r => !(r.post_id === postId && r.user_id === currentUser.id)
        );
        
        return {
          reactions: {
            ...state.reactions,
            [postId]: [...filteredReactions, newReaction]
          }
        };
      });

      return newReaction;
    } catch (error) {
      throw error;
    }
  },

  removeReaction: async (postId) => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) throw new Error('User not authenticated');

    try {
      set((state) => {
        const currentReactions = state.reactions[postId] || [];
        const filteredReactions = currentReactions.filter(
          r => !(r.post_id === postId && r.user_id === currentUser.id)
        );
        
        return {
          reactions: {
            ...state.reactions,
            [postId]: filteredReactions
          }
        };
      });

      const reactionData = {
        post_id: postId,
        user_id: currentUser.id,
        type: 'unlike'
      };

      await apiClient('/reactions/', {
        method: 'POST',
        body: reactionData,
      });

    } catch (error) {
      get().fetchReactions(postId);
      throw error;
    }
  },

  getReactionsByPostId: (postId) => get().reactions[postId] || [],
  getUserReaction: (postId) => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) return null;
    
    const reactions = get().reactions[postId] || [];
    return reactions.find(r => r.user_id === currentUser.id);
  },
  getReactionCount: (postId) => get().reactions[postId]?.length || 0,
  
  getReactionsByType: (postId) => {
    const reactions = get().reactions[postId] || [];
    const counts = {
      like: 0,
      love: 0,
      haha: 0,
      sad: 0
    };
    
    reactions.forEach(reaction => {
      if (counts.hasOwnProperty(reaction.type)) {
        counts[reaction.type]++;
      }
    });
    
    return counts;
  },
}));