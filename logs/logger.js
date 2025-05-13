const { Logs } = require('../schema/logger');
const moment = require('moment');

exports.RaiseLogEvent = async function (type, key, data, log) {
	try {
		const Log = new Logs({ type: type, key: key, data: data, log: log, date: moment().toISOString() });
		await Log.save();
	} catch (err) {
		console.log(err);
	}
}