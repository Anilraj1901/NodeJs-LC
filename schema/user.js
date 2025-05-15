// schema/user.js
"use strict";

let mongoose = require('../config/db').mongoose;

const UserSchema = new mongoose.Schema({
	userName: {
		type: String,
		required: true,
		unique: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	userRole: { // Admin, Customer 
		type: String,
		required: true
	},
	mobile: {
		type: Number,
		required: true
	}
});

const Users = mongoose.model('Users', UserSchema);

exports.Users = Users;
