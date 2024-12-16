import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async(req,res,next)=>{
   try {
    console.log("in try protectedRoute");
    
    if (!req.cookies) {
      console.log("No cookies found");
      return res.status(401).json({error: "No cookies found"});
    }
    const token = req.cookies.jwt;
    console.log(`token is ${token}`);
    if (!token) {
      console.log("Token not found in cookies");
      return res.status(401).json({error: "Token not found in cookies"});
    }
    
    //checks if the token exist if not that probally means the user is not logged in
    if(!token){
      return res.status(401).json({error:"You need to login first"})
    }
    
   //this decodes the token and verifies with the help of JWT_SECURET to make sure the token isn't tampred with
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(!decoded){
      return res.status(401).json({error:"Inavalid Token"})
    }
    //in this the user is searched in the mongoodb and select"-password" means not to retuen password from the search
    const user = await User.findById(decoded.userId).select("-password");
 
    if(!user){
      return res.status(404).json({error:"User not found"})
    }
    
    req.user =user;
    next();
   } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    return res.status(500).json({error: "Server error"});
   }
}