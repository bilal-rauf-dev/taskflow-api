const express = require('express');
const authenticate = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/role');
const { getProductivityReport } = require('../../controllers/admin.controller');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('admin'));

router.get('/productivity', getProductivityReport);

module.exports = router;
