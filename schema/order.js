"use strict";

let mongoose = require('../config/db').mongoose;

const OrderSchema = new mongoose.Schema({
	UserId: {
		type: Number,
		required: true
	},
	productId: {
		type: Number,
		required: true
	},
	quantity: {
		type: Number,
		required: true
	},
	date: {
		type: Date,
		required: true
	},
	product: {
		type: JSON,
		required: true
	},
	status: { // Cart, Orderd 
		type: String,
		required: true
	},
});

const Orders = mongoose.model('Orders', OrderSchema);

exports.Orders = Orders;