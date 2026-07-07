const router=require("express").Router();

const passport=require("passport");

const jwt=require("jsonwebtoken");

router.get(

"/google",

passport.authenticate(

"google",

{

scope:["profile","email"]

}

)

);

router.get(

"/google/callback",

passport.authenticate(

"google",

{

session:false

}

),

(req,res)=>{

const token=jwt.sign(

{

id:req.user._id

},

process.env.JWT_SECRET

);

res.json({

token,

user:req.user

});

}

);

module.exports=router;