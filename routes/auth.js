const jwt = require('jsonwebtoken');
var registerModel = require('../models/register.model');

//Authenticate
const verifyToken = (req, res, next) => {
    if (req.headers['authorization']) {
        req.token = req.headers['authorization'].split(' ')[1];
        jwt.verify(req.token, process.env.SECRET_KEY, function (err, decoded) {
            if (err) {
                res.status(401).json({ auth: false, token: req.token, status: 'unauthorized' });
            } else {
                console.log(decoded);
                registerModel.findOne({
                    email: decoded.email
                }, (err, data) => {
                    if (err) console.log('err', err);
                    console.log(data);
                    if (req.token === data.token) {
                        // res.status(200).json({ auth: true, token: req.token, status: 'authorized' });
                        next();
                    } else {
                        res.status(401).json({ auth: false, token: req.token, status: 'unauthorized' });
                    }
                });
            }
        })
    } else {
        res.status(401).json({ auth: false, token: req.token, status: 'unauthorized' });
    }
}

module.exports = verifyToken;