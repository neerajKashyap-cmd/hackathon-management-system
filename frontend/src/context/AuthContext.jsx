import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("hms_user");
      return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    } catch (e) {
      localStorage.removeItem("hms_user");
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Sync user state with backend /me check on load
  useEffect(() => {
    if (user?.token) {
      api
        .get("/auth/me")
        .then((res) => {
          const updated = { ...user, ...res.data };
          setUser(updated);
          localStorage.setItem("hms_user", JSON.stringify(updated));
        })
        .catch((err) => {
          if (err.response?.status === 401 || err.response?.status === 403) {
            logout();
          }
        });
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      setUser(res.data);
      localStorage.setItem("hms_user", JSON.stringify(res.data));
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Invalid credentials",
      };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googlePayload) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/google", googlePayload);
      setUser(res.data);
      localStorage.setItem("hms_user", JSON.stringify(res.data));
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Google Authentication failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", formData);
      setUser(res.data);
      localStorage.setItem("hms_user", JSON.stringify(res.data));
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email, otp) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      setUser(res.data);
      localStorage.setItem("hms_user", JSON.stringify(res.data));
      return { success: true, data: res.data, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "OTP verification failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (email) => {
    try {
      const res = await api.post("/auth/resend-otp", { email });
      return {
        success: true,
        message: res.data.message,
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to resend OTP",
      };
    }
  };

  const updateProfile = async (formData) => {
    try {
      const res = await api.put("/auth/profile", formData);
      const updated = { ...user, ...res.data };
      setUser(updated);
      localStorage.setItem("hms_user", JSON.stringify(updated));
      return { success: true, data: updated };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update profile",
      };
    }
  };

  const toggleBookmark = async (hackathonId) => {
    try {
      const res = await api.post(`/auth/bookmark/${hackathonId}`);
      const updatedBookmarks = res.data.bookmarkedHackathons;
      const updatedUser = { ...user, bookmarkedHackathons: updatedBookmarks };
      setUser(updatedUser);
      localStorage.setItem("hms_user", JSON.stringify(updatedUser));
      return { success: true, bookmarked: updatedBookmarks.includes(hackathonId) };
    } catch (err) {
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hms_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        verifyOTP,
        resendOTP,
        logout,
        updateProfile,
        toggleBookmark,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
