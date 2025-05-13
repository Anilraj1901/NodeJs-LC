// routes/api/Users/user.js
const { Users } = require('../../../schema/user');
const logger = require('../../../logs/logger');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.create = async function (req, res) {
	try {
		let { userName, email, password, firstName, lastName, userRole, mobile } = req.body;

		if (!userName || !password || !email || !userRole) {
			return res.status(400).send({ success: false, message: 'These fields are required: UserName, Password, Email, UserRoles' });
		}

		if (!['Admin', 'Customer'].includes(userRole)) {
			return res.status(400).send({ success: false, message: 'User creation is limited to admin and customer roles.' });
		}

		const existingUser = await Users.findOne({ userName: userName });

		if (existingUser) {
			return res.status(400).send({ success: false, message: 'Username already exists' });
		}

		const adminUser = await Users.findOne({ userRole: 'Admin' });

		if (adminUser) {
			return res.status(400).send({ success: false, message: 'Admin user already exists' });
		}

		const salt = await bcrypt.genSalt(10);

		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new Users({ userName, email, password: hashedPassword, firstName, lastName, userRole, mobile });

		await newUser.save();

		return res.status(201).send({ success: true, message: 'User created successfully' });

	} catch (err) {
		console.log(`api/users/create`, err);
		logger.RaiseLogEvent('api/users/create', 'error', err, `Data ${JSON.stringify(req.body)}`);
		return res.status(500).send({ success: false, error: 'Error in processing your request.' });
	}
};


exports.login = async function (req, res) {
	try {
		let { userName, password } = req.body;

		if (!userName || !password) {
			return res.status(400).send({ success: false, message: 'All fields are required' });
		}

		let User = await Users.findOne({ userName: userName });

		if (!User) {
			return res.status(400).send({ success: false, message: 'User not found' });
		}

		let checkPassword = await bcrypt.compare(password, User.password);

		if (!checkPassword) {
			return res.status(400).send({ success: false, message: 'Incorrect password' });
		}

		// Generate JWT
		let token = jwt.sign({ id: User.id, userRole: User.userRole, userName: User.userName }, 'secretKey', { expiresIn: '8h' });

		return res.status(201).send({ success: true, message: token });

	} catch (err) {
		console.log(`api/users/login`, err);
		logger.RaiseLogEvent('api/users/login', 'error', err, `Data ${JSON.stringify(req.body)}`);
		return res.status(500).send({ success: false, error: 'Error in processing your request.' });
	}
}

exports.delete = async function (req, res) {
	try {
		logger.RaiseLogEvent('api/users/delete', 'request', req.body, `Requested from ${req.locals.user.id}`);

		let User = await Users.findById(req.params.id);

		if (!User) {
			return res.status(400).send({ success: false, message: 'User not found' });
		}

		await User.deleteOne();

		return res.status(201).send({ success: false, message: 'User deleted successfully' });

	} catch (err) {
		console.log(`api/users/delete`, err);
		logger.RaiseLogEvent('api/users/delete', 'error', err, `Data ${JSON.stringify(req.params.id)}`);
		return res.status(500).send({ success: false, message: 'Error in delete users' });
	}
}

exports.update = async function (req, res) {
	try {
		logger.RaiseLogEvent('api/users/update', 'request', req.body, `Requested from ${req.locals.user.id}`);

		if (!req.params.id) {
			return res.status(400).send({ success: false, message: 'Input parameter missing' });
		}

		let User = await Users.findById(req.params.id);

		if (!User) {
			return res.status(400).send({ success: false, message: 'User not found' });
		}

		const salt = await bcrypt.genSalt(10);

		const hashedPassword = await bcrypt.hash(req.body.password, salt);

		Object.assign(User, { ...req.body, ...{ password: hashedPassword } });

		await User.save();

		return res.status(201).send({ success: false, message: 'User updated successfully' });

	} catch (err) {
		console.log(`api/users/update`, err);
		logger.RaiseLogEvent('api/users/update', 'error', err, `Data ${JSON.stringify(req.body)}`);
		return res.send({ success: false, message: 'Error updating User' });
	}
}