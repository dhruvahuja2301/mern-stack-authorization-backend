const express = require('express');
const { verify } = require('jsonwebtoken');
const User = require("../models/user");
const { createAccessToken, createRefreshToken, sendAccessToken, sendRefreshToken } = require("../middleware/tokens");
const router =  express.Router();
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  
router.route("/").post(async (req,res)=>{
    try {
        const token = req.session.refreshtoken
        // if no token
        // console.log(1)
        if(!token) return res.json({accesstoken: '', user: { id: '', name: '', email: '' }});
        // we have a token so verrify token
        let payload=null;
        payload = verify(token, process.env.JWT_REFRESH_SECRET);
        // token is valid, check if user exists
        const user = await User.findById( payload.id );
        // console.log(2)
        if (!user) {
            // req.session.refreshtoken=undefined;
            return res.json({accesstoken: '', user: { id: '', name: '', email: '' }});
        }
        // user exists, check refresh token exists on user 
        // console.log(user,token)
        // console.log(3)
        if(user.refreshtoken !== token) return res.json({accesstoken: '', user: { id: '', name: '', email: '' }});
        // token exists create new refresh and access token
        // console.log(4)
        const accesstoken = createAccessToken(user.id);
        const refreshtoken = createRefreshToken(user.id)
        // store refresh token in database
        user.refreshtoken = refreshtoken
        await user.save()

        sendRefreshToken(req, refreshtoken);
        sendAccessToken(res, accesstoken, user);

    } catch (err) {
        return res.json({accesstoken: '', user: { id: '', name: '', email: '' }});
    }
    
});

module.exports = router