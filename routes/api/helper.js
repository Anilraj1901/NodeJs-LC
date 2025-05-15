const jwt = require('jsonwebtoken');
const security = require('../../config/security.json');
var multer = require('multer');
var moment = require('moment');


//Middleware for JWT authentication
//#region Admin user validation
exports.requireAdminLogin = async function (req, res, next) {
	const token = req.headers['sessiontoken'];
	if (!token) {
		return res.status(400).send({ success: false, error: 'Access Denied' });
	};
	// Verify the token
	jwt.verify(token, security.sessionToken, (err, decoded) => {
		if (err) {
			console.log(err);
			return res.status(403).send({ success: false, message: 'Invalid or expired token' });
		}
		if (decoded.userRole != 'Admin') {
			res.status(403).send({ success: false, error: 'Not Authorized' });
		}
		req.locals = { user: decoded };
		next();
	});
};
//#endregion

//#region User validation
exports.validateUserToken = async function (req, res, next) {
	const token = req.headers['sessiontoken'];
	if (!token) {
		return res.status(400).send({ success: false, error: 'Access Denied' });
	};
	// Verify the token
	jwt.verify(token, security.sessionToken, (err, decoded) => {
		if (err) {
			console.log(err)
			return res.status(403).send({ success: false, message: 'Invalid or expired token' });
		}
		req.locals = { user: decoded };
		next();
	});
};
//#endregion

// Image Upload
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './temp')
	},
	filename: function (req, file, cb) {
		var name = file.originalname;
		var ext = '';
		if (file.originalname.split(".").length > 1) {
			// use file extension if available
			name = file.originalname.substring(0, file.originalname.lastIndexOf('.'));
			ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
		}
		cb(null, name + '_' + moment().format("YYYYMMDD_HHmmss") + ext);
	}
})

const imageFilter = function (req, file, cb) {
	if (['image/jpeg', 'image/png'].indexOf(file.mimetype) > -1) {
		cb(null, true);
	} else {
		cb(new Error('Unsupported file format.'), false);
	}
}

exports.upload = multer({
	storage: storage,
	limits: { fileSize: 1024 * 1024 * 5 },
	fileFilter: imageFilter
});