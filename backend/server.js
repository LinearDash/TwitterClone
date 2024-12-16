
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js"
import connectMongoDB from "./db/connectMongoDB.js";
import cors from "cors";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


//this is to convert the request into readable format
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json());
app.use(cookieParser());


app.use("/api/auth",authRoutes)

app.listen(PORT,()=>{
  //Running at port 5000
  console.log(`server is running on port : ${PORT}`);
  connectMongoDB();
  
})