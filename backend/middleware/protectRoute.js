import User from "../models/user.model.js";

export const protectRoute = async(req,res,next)=>{
   try {
    
    const token = req.cookies.jwt;
    //checks if the token exist if not that probally means the user is not logged in
    if(!token){
      return res.status(401).json({error:"You need to login first"})
    }
    
   //this decodes the token and verifies with the help of JWT_SECURET to make sure the token isn't tampred with
    const decoded = jwt.verify(token, process.env.JWT_SECURET);
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