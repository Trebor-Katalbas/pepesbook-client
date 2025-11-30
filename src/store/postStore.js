import { create } from 'zustand';
import { apiClient } from '../utils/apiClient.js';
import { useAuthStore } from './authStore.js';

export const usePostStore = create((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,

  setPosts: (posts) => set({ posts }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const posts = await apiClient('/posts/');
      set({ 
        posts: posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch posts', 
        isLoading: false 
      });
    }
  },

  createPost: async (postData) => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const formData = new FormData();
      formData.append('content', postData.content);
      formData.append('user_id', currentUser.id);
      
      if (postData.image) {
        formData.append('image', postData.image);
      }

      const newPost = await apiClient('/posts/', {
        method: 'POST',
        body: formData,
      });
      
      set((state) => ({
        posts: [newPost, ...state.posts]
      }));
      
      return newPost;
    } catch (error) {
      set({ error: error.message || 'Failed to create post' });
      throw error;
    }
  },

  deletePost: async (postId) => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) throw new Error('User not authenticated');

    try {
      await apiClient(`/posts/${postId}?user_id=${currentUser.id}`, {
        method: 'DELETE',
      });
      
      set((state) => ({
        posts: state.posts.filter(post => post.id !== postId)
      }));
      
      return postId;
    } catch (error) {
      set({ error: error.message || 'Failed to delete post' });
      throw error;
    }
  },

  getPosts: () => get().posts,
  getPostById: (postId) => get().posts.find(post => post.id === postId),
}));