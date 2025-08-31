import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    // console.log("🔎 Running checkAuth...");
    try {
     const token = localStorage.getItem('jwt-token');
      if (!token) {
      set({ authUser: null, isCheckingAuth: false });
      return;
    }
          const res = await axiosInstance.get("/auth/check");
    set({ authUser: res.data });
    get().connectSocket();
  } catch ( error) {
    console.error("❌ checkAuth error:", error?.response?.data || error.message);
    localStorage.removeItem('jwt-token'); 
    set({ authUser: null });
  } finally {
    set({ isCheckingAuth: false });
  }
},
  signup: async (data) => {
  set({ isSigningUp: true });
  try {
    const res = await axiosInstance.post("/auth/signup", data);
    
    // Token save karein
    if (res.data.token) {
      localStorage.setItem('jwt-token', res.data.token);
    }

    set({ authUser: res.data.user || res.data });
    toast.success("Account created successfully");
    get().connectSocket();
  } catch (error) {
    toast.error(error.response?.data?.message || "Signup failed");
  } finally {
    set({ isSigningUp: false });
  }
},

  login: async (data) => {
  // console.log("🔑 Logging in with:", data);
  set({ isLoggingIn: true });
  try {
    const res = await axiosInstance.post("/auth/login", data);
    // console.log("✅ Login success:", res.data);

    // Token localStorage mein save karein
    if (res.data.token) {
      localStorage.setItem('jwt-token', res.data.token);
    }

    set({ authUser: res.data.user || res.data }); // User object properly set karein
    toast.success("Logged in successfully");
    get().connectSocket();
  } catch (error) {
    console.error("❌ Login error:", error?.response?.data || error.message);
    toast.error(error.response?.data?.message || "Login failed");
  } finally {
    set({ isLoggingIn: false });
  }
},

  logout: async () => {
  try {
    await axiosInstance.post("/auth/logout");
    
    // Token localStorage se remove karein
    localStorage.removeItem('jwt-token');
    
    set({ authUser: null });
    toast.success("Logged out successfully");
    get().disconnectSocket();
  } catch (error) {
    toast.error(error.response?.data?.message || "Logout failed");
  }
},

  updateProfile: async (data) => {
    // console.log("🛠️ Updating profile with:", data);
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      // console.log("✅ Profile updated:", res.data);

      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("❌ Update profile error:", error?.response?.data || error.message);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
      // console.log("ℹ️ Update profile finished");
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser) {
      console.log("⚠️ No authUser, socket not connected");
      return;
    }
    if (get().socket?.connected) {
      console.log("⚠️ Socket already connected");
      return;
    }

    // console.log("🔌 Connecting socket for user:", authUser._id);

    const socket = io(BASE_URL, {
      query: { userId: authUser._id },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("connect", () => {
      // console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("getOnlineUsers", (userIds) => {
      // console.log("📡 Online users received:", userIds);
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      console.log("🔌 Disconnecting socket...");
      get().socket.disconnect();
    } else {
      console.log("⚠️ No active socket to disconnect");
    }
  },
}));
