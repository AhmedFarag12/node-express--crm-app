const router = require('express').Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { singleImage } = require('../middleware/upload');
const ctrl = require('../controllers/auth.controller');
const schema = require('../validations/auth.validation');

router.post('/register', validate(schema.register), ctrl.register);
router.post('/login', validate(schema.login), ctrl.login);
router.get('/me', auth, ctrl.me);
router.patch('/change-password', auth, validate(schema.changePassword), ctrl.changePassword);
router.post('/me/avatar', auth, singleImage('avatar'), ctrl.uploadMyAvatar);
router.delete('/me/avatar', auth, ctrl.removeMyAvatar);

module.exports = router;
