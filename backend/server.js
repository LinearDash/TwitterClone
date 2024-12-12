
import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js"
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT
app.use("/api/auth",authRoutes)

app.listen(PORT,()=>{
  //Running at port 5000
  console.log(`server is running on port : ${PORT}`);
  connectMongoDB();
  
})