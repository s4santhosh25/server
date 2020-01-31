const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });

const registerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    userId: {
        type: String,
        required: true,
        unique: true
    },
    token: {
        type: String,
        default: null
    },
    imageUrl: {
        type: String,
        default: null
    },
    idpId: {
        type: String,
        default: null
    }
});

const registerModel = mongoose.model('users', registerSchema, 'users');

module.exports = registerModel
