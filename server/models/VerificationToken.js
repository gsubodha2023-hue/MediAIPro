import mongoose from "mongoose";
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},tokenHash:{type:String,required:true,unique:true},type:{type:String,enum:["email","two_factor"],required:true},expiresAt:{type:Date,required:true,index:{expires:0}}},{timestamps:true});
export default mongoose.model("VerificationToken",schema);
