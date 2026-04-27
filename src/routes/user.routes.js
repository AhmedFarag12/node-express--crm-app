const router = require('express').Router();
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/permissions');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/user.controller');
const schema = require('../validations/user.validation');

router.use(auth, isAdmin);

router.get('/', validate(schema.list), ctrl.list);
router.post('/', validate(schema.create), ctrl.create);
router.get('/:id', validate(schema.getById), ctrl.getById);
router.patch('/:id', validate(schema.update), ctrl.update);
router.delete('/:id', validate(schema.getById), ctrl.remove);

module.exports = router;
