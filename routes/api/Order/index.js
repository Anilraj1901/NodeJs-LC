'use strict';

var express = require('express');
var controller = require('./order.js');
var router = express.Router();
var helper = require('../helper');

router.post('/create', helper.validateUserToken, controller.create);
router.get('/list', helper.validateUserToken, controller.list);

module.exports = router;