import mongoose, { Types } from "mongoose";

const userSchema = new mongoose.schema({
  username:{
    type: String,
    require: true,
    unique: true
  },
  fullName:{
    type :String,
    required: true,
  },
  password:{
    type:String,
    required:true,
    minLength:6,
  },
  email:{
    type:String,
    required:true,
    unique:true,

  },
  followers:[{
    type: mongoose.schema.Types.ObjectId,//Idk what the hell is this type
    ref:"User",
    default:[]
  }],
  following:[{
    type: mongoose.schema.Types.ObjectId,
    ref:"User",
    default:[]
  }],
  profileImg:{
    type:String,
    default:"",
  },
  coverImg:{
    type:String,
    default:"",
  },
  bio:{
    type:String,
    default:"",
  },
  link:{
    type:String,
    default:""
  }
  

},{timestamps:true})

const User = mongoose.model("User",userSchema);

export default User;