const router=require("express").Router();

const Habit=require("../models/Habit");

const HabitLog=require("../models/HabitLog");

router.post(

"/add",

async(req,res)=>{

const habit=

await Habit.create({

title:req.body.title,

squadId:req.body.squadId,

createdBy:req.body.userId

});

res.json(habit);

}

);

router.post(

"/complete",

async(req,res)=>{

const log=

await HabitLog.create({

habitId:req.body.habitId,

userId:req.body.userId,

date:new Date(),

completed:true

});

res.json(log);

}

);

module.exports=router;