import axios from "axios";
import { redirect } from "next/navigation";

/**
 * Axios client configured for FastAPI backend
 * - Sets base URL from environment variable
 * - Enables withCredentials for HTTP-only cookie handling
 * - Adds response interceptor for 401 handling
 */
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor: redirect to login on 401
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we're in the browser
      // Don't redirect for login/register endpoints (they handle errors themselves)
      if (typeof window !== "undefined") {
        const url = error.config?.url || "";
        const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register");
        
        if (!isAuthEndpoint) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

