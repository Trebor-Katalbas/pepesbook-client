import { create } from 'zustand';
import { apiClient } from '../utils/apiClient';
import { useAuthStore } from './authStore';

export const useCommentStore = create((set, get) => ({
  comments: {},
  isLoading: false,

  setComments: (postId, comments) => set((state) => ({
    comments: {
      ...state.comments,
      [postId]: comments
    }
  })),

  setLoading: (isLoading) => set({ isLoading }),

  fetchComments: async (postId) => {
    set({ isLoading: true });
    try {
      const comments = await apiClient(`/comments/${postId}`);
      get().setComments(postId, comments);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createComment: async (postId, content) => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const commentData = {
        post_id: postId,
        user_id: currentUser.id,
        content
      };

      const newComment = await apiClient('/comments/', {
        method: 'POST',
        body: commentData,
      });
      
      set((state) => ({
        comments: {
          ...state.comments,
          [postId]: [...(state.comments[postId] || []), newComment]
        }
      }));

      return newComment;
    } catch (error) {
      throw error;
    }
  },

  deleteComment: async (commentId, postId) => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) throw new Error('User not authenticated');

    try {
      set((state) => ({
        comments: {
          ...state.comments,
          [postId]: (state.comments[postId] || []).filter(comment => comment.id !== commentId)
        }
      }));

      await apiClient(`/comments/${commentId}?user_id=${currentUser.id}`, {
        method: 'DELETE',
      });

      return commentId;
    } catch (error) {
      get().fetchComments(postId);
      throw error;
    }
  },

  getCommentsByPostId: (postId) => get().comments[postId] || [],
}));