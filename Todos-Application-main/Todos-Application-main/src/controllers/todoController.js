const Todos = require('../db/todos');

const updateKeys = ['description', 'completed', 'title', 'items'];

module.exports.todoList = async ( req, res) => {
    try {
        const todos = await Todos.find({ $or: [
            { 
                owner: req.user._id, ...req.params 
            }, 
            { 
                contributors: req.user._id 
            }
            
        ]});
        res.status(200).send(todos);
    }
    catch(error) {
        console.log(error);
        res.status(400).send({
            error: error.message
        })
    }
};

module.exports.todoDetails = async ({ params, user } , res) => {
    try {
        const todo = await Todos.findOne({ _id: params.id, $or: [
            { owner: user._id }, 
            { contributors: user._id }
        ]});

        if (todo == null || todo === undefined) {
            res.status(404).send({
                error: `Record with id ${params.id} not found`
            });
            return;
        }

        res.status(200).send(todo);
    }
    catch(error) {
        res.status(400).send({
            error: error.message
        })
    }
};

module.exports.todoUpdate = async ({ params, body, user }, res) => {
    try {

        let validUpdate = Object.keys(body).every((key) => {
            return updateKeys.includes(key);
        })
        
        if (!validUpdate) {
            throw new Error('Invalid update parameters');
        }

        let db = await Todos.findOne({ _id: params.id, $or: [
            { owner: user._id }, 
            { contributors: user._id }
        ]});

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

module.exports.todoShare = async ({ body, user }, res) => {
    try {
        body.forEach(async item => {
            const db = await Todos.findOne({ _id: item.id, owner: user._id });

            const isFound = db.contributors.find(c => c == item.contributor);
            const isFriend = db.friends.find(c => c == item.friends);

            if (!isFound && isFriend) {
                db.contributors.push(item.contributor);
                await db.save();
            }
        });

        res.status(200).send();
    }
    catch(error) {
        res.status(400).send({
            error: error.message
        })
    }
};

module.exports.todoCreate = async ( { body, user }, res) => {
    try {

        body.owner = user._id;
        const db = new Todos(body);
        await db.save();
        
        res.status(201).send(db);
    }
    catch(error) {
        res.status(400).send({
            error: error.message
        })
    }
};

module.exports.todoDelete = async ({ params, user}, res) => {
    try {
        await Todos.deleteOne({ _id: params.id, owner: user._id });
        res.status(200).send({});
    }
    catch(error) {
        res.status(400).send({
            error: error.message
        })
    }
};