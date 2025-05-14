var AWS = require("aws-sdk");
const fs = require('fs');
const logger = require('../logs/logger');

const s3 = new AWS.S3({
	endpoint: 'http://localhost:9000',
	accessKeyId: 'U5dc40hXT0rBOtSwM2Wf',
	secretAccessKey: 'EPW0LKA30GfnXrtIKBx0FYkZNRu64d07Obk9y17t',
	s3ForcePathStyle: true,
	signatureVersion: 'v4',
});

exports.s3FileUploader = (data) => {
	try {

		let fileStats = fs.statSync(data.file);
		data.fileSizeInMB = fileStats.size / 1000000;

		logger.RaiseLogEvent("s3FileUploader", "log", data, `File: ${data.file}; size: ${data.fileSizeInMB} MB`);

		fs.readFile(data.file, (err, fileData) => {
			if (err) {
				console.log("Failed to read file: " + JSON.stringify(data));
				console.log(err);
				logger.RaiseLogEvent("s3FileUploader", "error", err, `Data: ${JSON.stringify(data)}`);
				return s3FileUploader(data);
			}
			const params = {
				Bucket: 'nodejs-lc',
				Key: data.s3Path,
				Body: fileData
			};

			s3.upload(params, function (err, reply) {
				if (err) {
					console.log("s3FileUploader - Failed to upload file to s3: " + JSON.stringify(reply));
					console.log(JSON.stringify(err));
					logger.RaiseLogEvent("s3FileUploader", "error", err, `Data: ${JSON.stringify(data)}`);
					return;
				} else {
					console.log(`s3FileUploader - File uploaded to ${reply.Location}`);
					logger.RaiseLogEvent("s3FileUploader", "log", reply, `File uploaded @ ${reply.Location}`);
					fs.unlink(data.file, function (err) {
						if (err) console.log(`${data.file} File delete error:`, err);
					});
					return;
				}
			});
		});
	} catch (err) {
		console.log('s3FileUploader error:', err.message);
		logger.RaiseLogEvent("s3FileUploader", "error", err, `error uploading images`);
		return;
	}
}