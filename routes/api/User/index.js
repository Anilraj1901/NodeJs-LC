'use strict';

var express = require('express');
var controller = require('./user.js');
var router = express.Router();
var helper = require('../helper');

router.post('/create', helper.requireAdminLogin, controller.create);
router.post('/login', controller.login);
router.put('/:id', helper.requireAdminLogin, controller.update);
router.delete('/:id', helper.requireAdminLogin, controller.delete);

module.exports = router;