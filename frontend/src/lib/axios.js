import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" 
    ? "http://localhost:5001/api" 
    : "/api",
 withCredentials: false, // TEMPORARILY DISABLE
  headers: {
    'Content-Type': 'application/json'
  }
});

// 🔍 Request interceptor
axiosInstance.interceptors.request.use((config) => {
  // localStorage se token get karein
  const token = localStorage.getItem('jwt-token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // console.log("📤 Axios Request:");
  // console.log("  URL:", config.baseURL + config.url);
  // console.log("  Headers:", config.headers);
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 🔍 Response interceptor
axiosInstance.interceptors.response.use((response) => {
  // console.log("📥 Axios Response:");
  // console.log("  URL:", response.config.url);
  // console.log("  Status:", response.status);
  // console.log("  Data:", response.data);
  return response;
}, (error) => {
  if (error.response) {
    console.error("❌ Response Error:");
    console.error("  URL:", error.response.config.url);
    console.error("  Status:", error.response.status);
    console.error("  Data:", error.response.data);
  } else {
    console.error("❌ Network/Other Error:", error.message);
  }
  return Promise.reject(error);
});
