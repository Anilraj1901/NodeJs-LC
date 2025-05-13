"use strict";

let mongoose = require('../config/db').mongoose;

const LogSchema = new mongoose.Schema({
	type: {
		type: String,
		required: true
	},
	key: {
		type: String,
		required: true
	},
	data: {
		type: JSON,
		required: true
	},
	date: {
		type: Date,
		required: true
	},
	log: {
		type: String,
		required: true
	}
});

const Logs = mongoose.model('Logs', LogSchema);

exports.Logs = Logs;