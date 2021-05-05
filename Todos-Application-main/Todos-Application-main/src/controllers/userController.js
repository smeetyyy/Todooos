const sharp = require('sharp');
const User = require('../db/user');

const excludedKeys = '-password -tokens -__v -friends -roles -createdAt -updatedAt';
const updateKeys = ['email', 'password', 'name', 'phone', 'avatar', 'friends', 'gender', 'tags'];

module.exports.userFriendList = async (req, res) => {
    try {
        const users = await User.find({ _id: req.user._id })
            .populate('friends', excludedKeys);

        res.status(200).send(users);
    }
    catch(error) {
        res.status(400).send({
            error: error.message
        })
    }
};

module.exports.userDetails = async (req , res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).send(user);
    }
    catch(error) {
        res.status(400).send({
            error: error.message
        })
    }
};

module.exports.userUpdate = async ({ user, body }, res) => {
    try {

        let validUpdate = Object.keys(body).every((key) => {
            return updateKeys.includes(key);
        })
        
        if (!validUpdate) {
            throw new Error('Invalid update parameters');
        }

        let db = await User.findById(user._id);
        Object.keys(body).forEach((key) => {
            db[key] = body[key];
        });
        
        await db.save();
        res.status(200).send(db);
    }
    catch(error) {
        res.status(400).send({
            error: error.message
        })
    }
};

module.exports.userCreate = async ( { body }, res) => {
    try {
        const db = new User(body);
        await db.save();
        
        res.status(201).send({ 
            user: db.toJSON(),
            token: await db.generateToken(),
        })
    }
    catch(error) {
        res.status(400).send({
            error: error.message
        })
    }
};

module.exports.userAddFriends = async ({ body, user }, res) => {
    try {
        body.forEach(item => {
            const isFound = user.friends.find(c => c == item.friend);

            if (!isFound) {
                user.friends.push(item.friend);
            }
        });

        await user.save();
        res.status(200).send();
    }
    catch(error) {
        res.status(400).send({
            error: error.message
        })
    }
};

module.exports.userRemoveFriends = async ({ body, user }, res) => {
    try {
        body.forEach(item => {
            const index = user.friends.indexOf(c => c == item.friend);
            if (index > -1) {
                user.friends.splice(index, 1);
                
            }
        });

        await user.save();
        res.status(200).send();
    }
    catch(error) {
        res.status(400).send({
            error: error.message
        })
    }
};

module.exports.userDelete = async (req, res) => {
    try {
        await User.deleteOne({ _id: req.user._id });
        res.status(200).send({});
    }
    catch(error) {
        res.status(400).send({
            error: error.message
        })
    }
};

module.exports.userLogin = async ({ body }, res) => {
    try {
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateToken();

        res.status(200).send(token);
    }
    catch(error) {
        res.status(401).send({
            error: "Invalid username/password"
        })
    }
};

module.exports.userLogout = async ({ token }, res) => {
    try {
        await User.revokeToken(token)
        res.status(200).send({ });
    }
    catch(error) {
        res.status(401).send({
            error: "Invalid username/password"
        })
    }
};

module.exports.userCreateAvatar = async ({ user, file }, res) => {
    try {
        user.avatar =  await sharp(file.buffer)
            .resize({ width:250, height:250 })
            .png()
            .toBuffer();

        await user.save();
        res.status(201).send();
    }
    catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
};

module.exports.userGetAvatar = async ({ params }, res) => {
 
    try {
        const user = await User.findById(params.id);
        res.set('Content-Type', 'image/jpg').status(200).send(user.avatar);
    }
    catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
};