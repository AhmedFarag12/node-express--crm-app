const router = require('express').Router();
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/permissions');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/lead.controller');
const schema = require('../validations/lead.validation');

router.use(auth);

router.get('/pipeline/summary', ctrl.pipelineSummary);

router.get('/', validate(schema.list), ctrl.list);
router.post('/', validate(schema.create), ctrl.create);
router.get('/:id', validate(schema.getById), ctrl.getById);
router.patch('/:id', validate(schema.update), ctrl.update);
router.delete('/:id', isAdmin, validate(schema.getById), ctrl.remove);

router.post('/:id/convert', validate(schema.convert), ctrl.convertToCustomer);

module.exports = router;
