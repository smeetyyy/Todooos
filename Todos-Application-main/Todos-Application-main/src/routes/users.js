const expires = require('express');

const error = require('./../middleware/error');
const upload = require('./../middleware/upload');
const auth = require('./../middleware/auth');

const controller = require('../controllers/userController');

const router = expires.Router();

router.get('/friends', auth, controller.userFriendList, error);
router.post('/friends', auth, controller.userAddFriends, error);
router.delete('/friends', auth, controller.userRemoveFriends, error);

router.get('/:id', auth, controller.userDetails, error);
router.post('/', controller.userCreate, error);
router.patch('/:id', auth, controller.userUpdate, error);
router.delete('/:id', auth, controller.userDelete, error);
router.post('/login', controller.userLogin, error);
router.post('/logout', auth, controller.userLogout, error);

router.post('/avatar', auth, upload.single('file'), controller.userCreateAvatar, error);
router.get('/avatar/:id', controller.userGetAvatar, error);

module.exports = router;