const mongoose=require("mongoose");

const habitSchema=new mongoose.Schema({

title:String,

squadId:{

type:mongoose.Schema.Types.ObjectId,

ref:"Squad"

},

createdBy:{

type:mongoose.Schema.Types.ObjectId,

ref:"User"

}

},
{
timestamps:true
}

);

module.exports=mongoose.model(

"Habit",

habitSchema

);