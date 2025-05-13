const jwt = require('jsonwebtoken');
const security = require('../../config/security.json');


//#region Middleware for JWT authentication
//#region Admin user validation
exports.requireAdminLogin = async function (req, res, next) {
	const token = req.headers['SessionToken'];
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
		req.locals.user = decoded;
		next();
	});
};
//#endregion

//#region User validation
exports.validateUserToken = async function (req, res, next) {
	const token = req.headers['SessionToken'];
	if (!token) {
		return res.status(400).send({ success: false, error: 'Access Denied' });
	};
	// Verify the token
	jwt.verify(token, security.sessionToken, (err, decoded) => {
		if (err) {
			console.log(err)
			return res.status(403).send({ success: false, message: 'Invalid or expired token' });
		}
		req.locals.user = decoded;
		next();
	});
};
//#endregion

//#endregion