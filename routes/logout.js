const express = require('express');
const router =  express.Router();
const { verify } = require('jsonwebtoken');
const User = require("../models/user");
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

router.route("/").post(async (req,res)=>{
    try {
        if(req.session.refreshtoken!=null){
            // req.session.refreshtoken = null;
            const { id } = verify(req.session.refreshtoken, process.env.JWT_REFRESH_SECRET);
            let user = await User.findById(id);
            user.refreshtoken=undefined;
            // console.log(user)
            await user.save(); 
            
            req.session.refreshtoken=undefined;
            res.json( { message: "Logged Out" } );
        }
        else {
            res.json( { message: "No User was Logged In" } );
        }
    } catch (err) {
        res.json({message:err})
    }
});

module.exports = router