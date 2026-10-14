import mongoose from "mongoose";
const schema=new mongoose.Schema({patient:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},uploadedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},title:{type:String,required:true},fileUrl:{type:String,required:true},mimeType:String,status:{type:String,enum:["uploaded","reviewed","explained"],default:"uploaded"},aiExplanation:String,reviewedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"}},{timestamps:true});
export default mongoose.model("LabReport",schema);
