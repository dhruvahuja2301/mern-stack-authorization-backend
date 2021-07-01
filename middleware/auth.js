const { verify } = require('jsonwebtoken');
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const auth = (req, res, next) => {
    const authorization = req.headers['authorization'];
    // token checking
    if(!authorization){
        return res.status(401).json({message: "You need to Login"});
    }
    try {
        // 'Bearer `token`'
        const token = authorization.split(' ')[1];
        // verify token
        const { id } = verify(token, process.env.JWT_ACCESS_SECRET);
        // add user from payload to req.user
        req.user = id;
        next();
    } catch (error) {
        return res.status(400).json({message: "Token is not valid"})       
    }
};

module.exports = auth;
// for every request to check for authentication add auth as a parameter in routes before ,(req,res)