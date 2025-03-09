import User from '../models/user.model.js'
import { generateToken } from '../lib/utils.js';
import bcrypt from 'bcryptjs'

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

export const login= (req,res)=>{
    res.send("login Page");
}

export const logout= (req,res)=>{
    res.send("logout Page");
}
