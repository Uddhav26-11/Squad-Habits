const mongoose=require("mongoose");

const habitLogSchema=new mongoose.Schema({

habitId:{

type:mongoose.Schema.Types.ObjectId,

ref:"Habit"

},

userId:{

type:mongoose.Schema.Types.ObjectId,

ref:"User"

},

date:Date,

completed:{

type:Boolean,

default:false

}

});

module.exports=mongoose.model(

"HabitLog",

habitLogSchema

);