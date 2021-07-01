const express = require('express');
const router =  express.Router();
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

router.route("/").post(async (req,res)=>{
    res.json({message: "This is protected data"});
});

module.exports = router

