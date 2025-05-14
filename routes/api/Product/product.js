const { Products } = require('../../../schema/product');
const logger = require('../../../logs/logger');
const moment = require('moment');
const upload = require('../../../config/upload');

exports.create = async function (req, res) {
	try {
		logger.RaiseLogEvent('api/products/create', 'request', req.body, `Requested from ${req.locals.user.id}`);

		const { name, price, quantity, category, gst, expDate, year, brand, model } = req.body;

		if (!name || !price || !quantity || !category) {
			return res.status(400).send({ success: false, message: 'Fields left empty' });
		}

		let validation = validateProductData(req.body);
		if (!validation.valid) {
			return res.status(400).send({ success: false, message: validation.message });
		}

		const existingProduct = await Products.findOne({ name: name, year: year });

		if (existingProduct) {
			return res.status(400).send({ success: false, message: 'Product already exists' });
		}

		let priceHistory = [{
			date: moment().toISOString(),
			price: price,
		}];

		const newProduct = new Products({ name, price, quantity, category, gst, expDate, year, brand, model, priceHistory });
		
		await newProduct.save();

		let images = (req.files) ? req.files.filter(files => {
			return files;
		}) : [];
		let imagePaths = [];

		if (images && images.length) {
			imagePaths = images.map(obj => {
				let s3Path = '/' + newProduct._id + '/products/' + new Date().getFullYear() + '_' + obj.filename;
				upload.s3FileUploader({ file: obj.path, s3Path: s3Path })
				return s3Path;
			});
			Object.assign(newProduct, { images: imagePaths });

			await newProduct.save();
		} 

		return res.status(201).send({ success: true, message: 'Product created successfully' });

	} catch (err) {
		console.log(`api/products/create`, err);
		logger.RaiseLogEvent('api/products/create', 'error', err, `Data ${JSON.stringify(req.body)}`);
		return res.status(500).send({ success: false, message: 'Error creating product' });
	}
};

exports.list = async function (req, res) {
	try {
		let whereClasue = {};

		if (req.body.category) {
			whereClasue.category = req.body.category;
		}
		if (req.body.name) {
			whereClasue.name = req.body.name;
		}
		if (req.body.brand) {
			whereClasue.brand = req.body.brand;
		}
		if (req.body.model) {
			whereClasue.model = req.body.model;
		}
		if (req.body.year) {
			whereClasue.year = req.body.year;
		}
		if (req.body.expired) {
			whereClasue.expDate = {
				$gte: req.body.startDate,
				$lte: req.body.endDate
			}
		}
		const products = await Products.find(whereClasue);

		return res.status(200).send({ success: true, results: products });

	} catch (err) {
		console.log(`api/products/list`, err);
		logger.RaiseLogEvent('api/products/list', 'error', err, `Data ${JSON.stringify(req.body)}`);
		return res.send({ success: false, message: 'Error fetching product' });
	}
}

exports.update = async function (req, res) {
	try {
		logger.RaiseLogEvent('api/products/update', 'request', req.body, `Requested from ${req.locals.user.id}`);

		const { price } = req.body;

		if (!req.params.id) {
			return res.status(400).send({ success: false, message: 'Input parameter missing' });
		}

		let validation = validateProductData(req.body);
		if (!validation.valid) {
			return res.status(400).send({ success: false, message: validation.message });
		}

		let Product = await Products.findById(req.params.id);

		if (!Product) {
			return res.status(400).send({ success: false, message: 'Product not found' });
		}

		let priceHistory = Product.priceHistory && JSON.parse(JSON.stringify(Product.priceHistory)) || [];

		if (Product.price != price) {
			priceHistory.push({
				date: moment().toISOString(),
				price: price
			})
		}

		Object.assign(Product, { ...req.body, ...{ priceHistory: priceHistory } });

		await Product.save();

		return res.status(201).send({ success: false, message: 'Product updated successfully' });

	} catch (err) {
		console.log(`api/products/update`, err);
		logger.RaiseLogEvent('api/products/update', 'error', err, `Data ${JSON.stringify(req.body)}`);
		return res.send({ success: false, message: 'Error updateing product' });
	}
}

exports.delete = async function (req, res) {
	try {
		logger.RaiseLogEvent('api/products/delete', 'request', req.body, `Requested from ${req.locals.user.id}`);

		let Product = await Products.findById(req.params.id);

		if (!Product) {
			return res.status(400).send({ success: false, message: 'Product not found' });
		}

		await Product.deleteOne();

		return res.status(201).send({ success: false, message: 'Product deleted successfully' });
	} catch (err) {
		console.log(`api/products/delete`, err);
		logger.RaiseLogEvent('api/products/delete', 'error', err, `Data ${JSON.stringify(req.params.id)}`);
		return res.send({ success: false, message: 'Error fetching product' });
	}
}

function validateProductData(data) {
	if (!data.name || typeof data.name !== 'string') {
		return { valid: false, message: 'Product name is required and should be a string.' };
	}

	if (!data.price || typeof data.price !== 'number' || data.price <= 0) {
		return { valid: false, message: 'Price is required and should be a positive number.' };
	}

	if (!data.quantity || typeof data.quantity !== 'number' || data.quantity < 0) {
		return { valid: false, message: 'Quantity is required and should be a non-negative number.' };
	}

	if (!data.category || typeof data.category !== 'string') {
		return { valid: false, message: 'Category is required and should be a string.' };
	}

	if (data.gst && typeof data.gst !== 'string' && data.gst.length >= 16) {
		return { valid: false, message: 'GST should be a string.' };
	}

	return { valid: true, message: 'Product data is valid.' };
}