const express = require('express');
const router =  express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { createAccessToken, createRefreshToken, sendAccessToken, sendRefreshToken } = require("../middleware/tokens");
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

router.route("/").post(async (req,res)=>{
    if(req.session.refreshtoken!=null) return res.json({message: 'Already Logged In'});
    const { email, password } = req.body;

    // simple validation
    if(!email || !password){
        return res.status(400).json({message: 'Please enter all fields'})
    }

    try {
        let user = await User.findOne({ email })
        // existing user?
        if (!user) {
            return res.status(400).json({message: 'User does not exists'});
        } else {
            // validate password
            const isMatch = await bcrypt.compare(password, user.password);
            // incorrect password
            if(!isMatch) {
                return res.status(400).json({message: 'Password is incorrect'});
            }
            // correct password
            // create refresh and access token
            else {
                const accesstoken = createAccessToken(user.id);
                const refreshtoken = createRefreshToken(user.id)
                
                // store refresh token in database
                user.refreshtoken = refreshtoken
                await user.save()

                sendRefreshToken(req, refreshtoken);
                sendAccessToken(res, accesstoken, user);
            }
        }
    } catch (err) {
        return res.status(500).json({message: "Login Failed"})
    }
});

module.exports = router