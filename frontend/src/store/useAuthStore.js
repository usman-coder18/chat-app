import {create} from "zustand"


import {axiosInstance} from "../lib/axios.js"
export const useAuthStore=create((set)=>({
    authUser: null,
    isSigningIn: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    

    isCheckingAuth: true,
    checkAuth:async ()=>{
        try {
            const res = await axiosInstance.get("/auth/check")
            set({authUser: res.data})
            
        } catch (error) {
            console.error("error in checkauth",error)
            set({authUser:null})
            
        }
        finally{
            set({isCheckingAuth:false})
        }
    }
 }));