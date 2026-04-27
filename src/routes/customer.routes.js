const router = require('express').Router();
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/permissions');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/customer.controller');
const schema = require('../validations/customer.validation');

router.use(auth);

router.get('/sales/monthly', ctrl.monthlySalesSummary);

router.get('/', validate(schema.list), ctrl.list);
router.post('/', validate(schema.create), ctrl.create);
router.get('/:id', validate(schema.getById), ctrl.getById);
router.patch('/:id', validate(schema.update), ctrl.update);
router.delete('/:id', isAdmin, validate(schema.getById), ctrl.remove);

router.post('/:id/purchases', validate(schema.recordPurchase), ctrl.recordPurchase);

module.exports = router;
