const { sign } = require('jsonwebtoken');

const createAccessToken = id => {
    return sign( { id }, process.env.JWT_ACCESS_SECRET, { expiresIn: 15 * 60 } )
};

const createRefreshToken = id => {
    return sign( { id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' } )
};

const sendAccessToken = (res, accesstoken, user) => {
    res.json( { accesstoken, user: { id: user.id, name: user.name, email: user.email } } );
};

const sendRefreshToken = (req, refreshtoken) => {
    // res.cookie('refreshtoken', refreshtoken, { httpOnly: true, path="/refreshtoken" } )
    req.session.refreshtoken = refreshtoken
};

module.exports = {
    createAccessToken,
    createRefreshToken,
    sendAccessToken,
    sendRefreshToken
}