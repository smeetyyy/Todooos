const mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const settings = require('./../common/settings');

const Todo = require('./todos');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    name: {
        type: String,
        required: true,
    },
    avatar: {
        type: Buffer,
    },
    gender: {
        type: String,
    },
    tags: [{
        type: String,
    }],
    roles: [{
        type: String,
    }],
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    tokens: [
        {
            token: {
                type: String,
                required: true,
            },
            expires: {
                type: Number,
                required: true,
            },
            revoked : {
                type: Boolean,
                required: true,
                default: false
            },
        }
    ],
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
})

userSchema.virtual('todos', {
    ref: 'Todo',
    localField: '_id',
    foreignField: 'owner',
})

userSchema.virtual('contributoring', {
    ref: 'Todo',
    localField: '_id',
    foreignField: 'contributors',
})

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
        console.log(this.password );
    }
    next();
})

userSchema.pre('remove', async function(next) {
    await Todo.deleteMany({ owner: this._id });
    next();
})

userSchema.methods.generateToken = async function() {
    const user = this;

    const activeTokens = user.tokens.filter((value) => {
        return !value.revoked && validateToken(value.token, 
            settings.secret, 
            settings.issuer, 
            settings.audience, 
            settings.subject)
    });

    if (activeTokens.length > 0) {
        return activeTokens[0].token;
    }

    const token = {
        token: generateToken(user._id, 
            settings.secret, 
            settings.issuer, 
            settings.audience, 
            settings.subject),

        expires: Math.floor(Date.now() / 1000) + (60 * 60),
        revoked: false,
    }

    user.tokens.push(token);
    await user.save();
    return token.token;
}

const generateToken = (id, secret, issuer, audience, subject) => {
    return jwt.sign({
        id: id,
        iat: Math.floor(Date.now() / 1000) - 30
    }, secret, {
        expiresIn: 60 * 60,
        audience,
        issuer,
        subject,
        jwtid: uuid.v4(),
        algorithm: 'HS256',
        encoding: 'UTF8'
    })
}

const validateToken = (token, secret, issuer, audience, subject) => {
    try
    {
        return jwt.verify(token, secret, {
            audience,
            issuer,
            subject,
            algorithm: 'HS256',
            encoding: 'UTF8'
        });
    }
    catch(e) {
        return false;
    }
}

userSchema.statics.findByCredentials = async function(email, password) {
    const user = await this.findOne({ email });

    if (!user) {
        console.log('Email is not correct');
        throw new Error("Invalid username/password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log('Password is not correct');
        throw new Error("Invalid username/password");
    }

    return user;
}

userSchema.statics.revokeToken = async function(token) {
    const user = await this.findOne({ 'tokens.token': token });

    if (!user) {
        throw new Error("Invalid token was provided");
    }

    user.tokens.forEach(value => {
        if (value.token == token) {
            value.revoked = true;
        }
    });

    user.save();
}

userSchema.methods.toJSON = function() {
    const user = this;

    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.__v;

    return userObject;
}

module.exports = mongoose.model('User', userSchema)