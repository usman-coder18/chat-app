import User from '../models/user.model.js'
import { generateToken } from '../lib/utils.js';
import bcrypt from 'bcryptjs'
import cloudinary from '../lib/cloudinary.js'

export const signup= async (req,res)=>{
    const{fullName,email,password}=req.body;
    try{
        if(!fullName || !email || !password){
            return res.status(400).json({message:"All fields are required"});
        }
        if(password.length < 8){
            return res.status(400).json({message:"Password must be atleast 8 characters long"});
        }
const user= await User.findOne({email})
if(user)
    return res.status(400).json({message:"User already exists"});
const salt= await bcrypt.genSalt(10);
const hashedPassword= await bcrypt.hash(password,salt);
const newUser= new User({
    fullName,
    email,
    password:hashedPassword});
    if(newUser){
        generateToken(newUser._id,res);
        await newUser.save();
        return res.status(201).json({
            _id:newUser._id,
            fullName:newUser.fullName,
            email:newUser.email,
            profilePic:newUser.profilePic
        });
    }else{
        return res.status(400).json({message:"Failed to create user"});

    }
 } catch(error){
    console.log("error in signup",error.message);
    return res.status(500).json({message:"Internal Server Error"});
    
 }
}

export const login= async (req,res)=>{
    const{email,password} = req.body;
  try{
const user = await User.findOne({email});
if(!user)
    return res.status(400).json({message:"Invalid Credentials"});
 const isPasswordCorrect = await bcrypt.compare(password,user.password)
 if(!isPasswordCorrect)
    return res.status(400).json({message:"Invalid Credentials"});
generateToken(user._id,res)
return res.status(200).json({
    _id:user._id,
    fullName:user.fullName,
    email:user.email,
    profilePic:user.profilePic
});
  }
catch(error){
    console.log("error in login controller",error.message);
    return res.status(500).json({message:"Internal Server Error"});
}
}

export const logout= (req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        return res.status(200).json({message:"Logged out successfully"});
    } catch (error) {
        console.log("error in logout controller",error.message);
        return res.status(500).json({message:"Internal Server Error"});
        
    }
}
export const updateProfile = async (req, res)=> {
    try {
            const{profilePic}=req.body;
         const usrId =   req.user._id 
         if(!profilePic){
            return res.status(400).json({message:"Profile Pic is required"});
        }
      const uploadresponse =  await cloudinary.uploader.upload(profilePic)
      const updatedUser = await User.findByIdAndUpdate(usrId, {profilePic:uploadresponse.secure_url}, {new: true})
      return res.status(200).json(updatedUser)
        
    }
    catch (error) {
        console.log("error in updateProfile controller",error.message);
        return res.status(500).json({message:"Internal Server Error"});
        
    }

}
export const checkAuth = async (req, res)=> {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("error in checkAuth controller",error.message);
         res.status(500).json({message:"Internal Server Error"});
        
    }

}