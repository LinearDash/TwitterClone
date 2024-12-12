import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req,res)=>
  {
  try {
    const {fullName,username,email,password}=req.body;

    const emailRegex =/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;// absoluty no clue what this is 
      if(!emailRegex.test(email)){
        return res.status(400).json({error:"Invalid email format"})
      }

    const existingUser = await User.findOne({username})//checks if the given username already exists or not
      if(existingUser){
        return res.status(400).json({error:"Username is already taken"});
      }

    const existingEmail = await User.findOne({email})//checks if the given email already exists or not
      if(existingEmail){
        return res.status(400).json({error:"Email is already taken"});
      }
    const salt = await bcrypt.genSalt(10)
    const hassedPassword= await bcrypt.hash(password,salt)
    const newUser =new User({
      fullName,
      username,
      email,
      password:hassedPassword
    })
      
    if(newUser){
      generateTokenAndSetCookie(newUser._id,res )// yet to write this function
      await newUser.save()

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg:newUser.coverImg
      })
    }
    else{
      res.status(400).json({error:"Invalid user data"})// if the date given is invalid
      
    }
  } catch (error) {
    console.log("error in signup controller");
    
    res.status(500).json({error:"Internal Server error "})
  }
}

export const login = async (req,res)=>
  {
  res.json({
   data:"login Endpoint hit"
  });
}

export const logout = async (req,res)=>
  {
  res.json({
   data:"logout Endpoint hit"
  });
}