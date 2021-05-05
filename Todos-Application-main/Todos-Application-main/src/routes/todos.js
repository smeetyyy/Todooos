const expires = require('express');

const auth = require('./../middleware/auth');
const controller = require('../controllers/todoController');

const router = expires.Router();


router.get('/', auth, controller.todoList);
router.get('/:id', auth, controller.todoDetails);
router.post('/', auth, controller.todoCreate);
router.post('/share', auth, controller.todoShare);
router.patch('/:id', auth, controller.todoUpdate);
router.delete('/:id', auth, controller.todoDelete);

module.exports = router;