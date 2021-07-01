const express = require('express');
const router =  express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { createAccessToken, createRefreshToken, sendAccessToken, sendRefreshToken } = require("../middleware/tokens");
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

// register
router.route("/").post(async (req,res)=>{
    if(req.session.refreshtoken!=null) return res.json({message: 'Already Logged In'});
    const { name, email, password } = req.body;

    // simple validation
    if(!name || !email || !password){
        return res.status(400).json({message: 'Please enter all fields'})
    }
    try {
        const userfind = await User.findOne({ email })
        // existing user?
        if (!userfind) {
            // create hash
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            const newUser = User({name, email, password: hash});
            // save user
            const user = await newUser.save();
            // create refresh and access token
            const accesstoken = createAccessToken(user.id);
            const refreshtoken = createRefreshToken(user.id)
                
            // store refresh token in database
            user.refreshtoken = refreshtoken
            await user.save()
            
            sendRefreshToken(req, refreshtoken);
            sendAccessToken(res, accesstoken, user);
        }
        else {
            res.status(400).json({message: 'User already registered with the email'})
        }
    } catch (err) {
        res.status(500).json({message: "Registration Failed"})
    }
});

module.exports = router