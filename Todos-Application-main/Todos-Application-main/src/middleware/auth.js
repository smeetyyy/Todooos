const jwt = require('jsonwebtoken');
const User = require('../db/user');
const settings = require('./../common/settings');

const Authorization = 'Authorization';
const Scheme = 'Bearer';

module.exports = async (req, res, next) => {
    try {
        const token = req.header(Authorization)
            .replace(Scheme, '')
            .trim();

        const decodedToken = jwt.verify(token, settings.secret, {
            issuer: settings.issuer,
            audience: settings.audience,
            subject: settings.subject
        });
        
        const user = await User.findOne({ 
            _id: decodedToken.id, 
            'tokens.token': token, 
            'tokens.revoked': false 
        });

        if (!user) {
            throw Error("User is not found. Token is revoked");
        }
        
        req.user = user;
        req.token = token;
        next();
    }
    catch(error) {
        res.status(401).send({
            error: "Not authenticated"
        })
    }
}