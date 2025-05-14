"use strict";

let mongoose = require('../config/db').mongoose;

const ProductSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	brand: {
		type: String
	},
	model: {
		type: String
	},
	year: {
		type: Number // YYYY
	},
	price: {
		type: Number,
		required: true
	},
	quantity: {
		type: Number,
		required: true
	},
	category: {
		type: String,
		required: true
	},
	gst: {
		type: String
	},
	expDate: {
		type: Date
	},
	priceHistory: {
		type: JSON,
		required: true
	},
	images: {
		type: JSON,
	}
});

const Products = mongoose.model('Products', ProductSchema);

exports.Products = Products;