
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from "cookies-parser";


import authRoutes from "./routes/auth.routes.js"
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT

//this is to convert the request into readable format
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());

app.use("/api/auth",authRoutes)

app.listen(PORT,()=>{
  //Running at port 5000k
  console.log(`server is running on port : ${PORT}`);
  connectMongoDB();
  
})