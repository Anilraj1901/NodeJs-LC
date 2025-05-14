'use strict';

var express = require('express');
var controller = require('./product');
var router = express.Router();
var helper = require('../helper');

router.post('/create', helper.requireAdminLogin, helper.upload.array('images') , controller.create);
router.get('/list', helper.validateUserToken, controller.list);
router.put('/:id', helper.requireAdminLogin, controller.update);
router.delete('/:id', helper.requireAdminLogin, controller.delete);

module.exports = router;