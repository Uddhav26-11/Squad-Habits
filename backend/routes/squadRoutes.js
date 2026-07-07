const router=require("express").Router();

const Squad=require("../models/Squad");

const {v4:uuid}=require("uuid");

router.post(

"/create",

async(req,res)=>{

const inviteToken=uuid();

const squad=await Squad.create({

name:req.body.name,

admin:req.body.userId,

members:[req.body.userId],

inviteToken,

expiresAt:

Date.now()+86400000

});

res.json(squad);

}

);

router.post(

"/join/:token",

async(req,res)=>{

const squad=

await Squad.findOne({

inviteToken:req.params.token

});

if(!squad){

return res.status(404)

.json({

message:"Invalid Link"

});

}

squad.members.push(

req.body.userId

);

await squad.save();

res.json({

message:"Joined"

});

}

);

module.exports=router;