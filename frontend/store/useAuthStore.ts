import { create } from "zustand";
import axiosClient from "@/app/api/axiosClient";

interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

/**
 * Zustand store for authentication state management
 * Handles login, logout, and session verification
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  /**
   * Register a new user with email and password
   * After successful registration, automatically logs in the user
   */
  register: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const response = await axiosClient.post("/auth/register", {
        email,
        password,
      });

      // Store user info
      set({
        user: response.data,
        loading: false,
      });

      // Automatically log in after registration
      await axiosClient.post("/auth/login", {
        email,
        password,
      });

      set({
        isAuthenticated: true,
      });
    } catch (error: any) {
      set({ loading: false });
      throw new Error(error.response?.data?.detail || "Registration failed");
    }
  },

  /**
   * Login user with email and password
   * Backend sets tokens in HTTP-only cookies automatically
   */
  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      await axiosClient.post("/auth/login", {
        email,
        password,
      });

      // Backend sets HTTP-only cookies (access_token and refresh_token)
      // Cookies are automatically sent with subsequent requests via withCredentials: true
      set({
        isAuthenticated: true,
        loading: false,
      });
    } catch (error: any) {
      set({ loading: false });
      throw new Error(error.response?.data?.detail || "Login failed");
    }
  },

  /**
   * Logout user and clear authentication state
   * Backend clears HTTP-only cookies automatically
   */
  logout: async () => {
    try {
      await axiosClient.post("/auth/logout");
      // Backend clears cookies via delete_cookie
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  /**
   * Check if user is authenticated by refreshing token
   * Uses HTTP-only cookies automatically (withCredentials: true in axiosClient)
   * Called by middleware to verify session
   */
  checkAuth: async () => {
    set({ loading: true });
    try {
      // Backend reads refresh_token from HTTP-only cookie automatically
      // Axios sends cookies automatically via withCredentials: true
      await axiosClient.post("/auth/refresh");
      set({
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      // Auth failed - cookies likely expired or missing
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      throw error;
    }
  },
}));

