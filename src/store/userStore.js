import { create } from "zustand";
import { apiClient } from "../utils/apiClient";

export const useUserStore = create((set, get) => ({
  users: {},

  setUser: (user) =>
    set((state) => ({
      users: {
        ...state.users,
        [user.id]: user,
      },
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
      const user = await apiClient("/users/", {
        method: "POST",
        body: userData,
      });
      get().setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  },

  updateProfilePicture: async (userId, imageFile) => {
    try {
      console.log(
        "userStore: Starting profile picture update for user:",
        userId
      );

      const formData = new FormData();
      formData.append("profile_pic", imageFile);

      const updatedUser = await apiClient(`/users/${userId}/profile-picture`, {
        method: "PUT",
        body: formData,
      });

      console.log("userStore: Received updated user:", updatedUser);

      get().setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("userStore: Error updating profile picture:", error);
      throw error;
    }
  },

  getUserById: (userId) => get().users[userId],
}));
