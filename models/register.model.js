const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

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
    token: {
        type: String,
        default: null
    }
});

const registerModel = mongoose.model('users', registerSchema, 'users');

module.exports = registerModel
