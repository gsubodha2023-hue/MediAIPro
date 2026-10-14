import mongoose from "mongoose";
const schema=new mongoose.Schema({patient:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},doctor:{type:mongoose.Schema.Types.ObjectId,ref:"Doctor",required:true},appointment:{type:mongoose.Schema.Types.ObjectId,ref:"Appointment",required:true,unique:true},rating:{type:Number,min:1,max:5,required:true},comment:{type:String,maxlength:1000},isPublished:{type:Boolean,default:true}},{timestamps:true});
export default mongoose.model("Review",schema);
