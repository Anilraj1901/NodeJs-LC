const { Orders } = require('../../../schema/order');
const logger = require('../../../logs/logger');
const moment = require('moment');

exports.create = async function (req, res) {
	try {
		logger.RaiseLogEvent('api/orders/create', 'request', req.body, `Requested from ${req.locals.user.id}`);

		const { UserId, productId, quantity, status, id } = req.body;

		if (!UserId || !productId || !quantity || !category || !status) {
			return res.status(400).send({ success: false, message: 'Fields left empty' });
		}

		if (!['Cart', 'Orderd' ].includes(status)) {
			return res.status(400).send({ success: false, message: 'Invalid status. Allowed values are "Cart" and "Orderd".' });
		}

		const User = await Orders.findOne({ id: UserId });

		if (!User) {
			return res.status(400).send({ success: false, message: 'User not found' });
		}

		const Product = await Orders.findOne({ id: productId });

		if (!Product) {
			return res.status(400).send({ success: false, message: 'Product not found' });
		}

		if (!id) { // cart to place order
			const Order = await Orders.findOne({ id: id });
			if (!Order) {
				return res.status(400).send({ success: false, message: 'Order not found' });
			}
			Object.assign(Order, { status: status });
			await Order.save();

		} else { // Cart or Order
			const newOrder = new Orders({ UserId, productId, quantity, status, ...{ product: Product, date: moment() } });
			await newOrder.save();
		}

		if(status == 'Orderd'){
			Object.assign(Product, { quantity: Number(Product.quantity) - Number(quantity) });
			await Product.save();
		}

		return res.status(201).send({ success: true, message: 'Order created successfully' });

	} catch (err) {
		console.log(`api/orders/create`, err);
		logger.RaiseLogEvent('api/orders/create', 'error', err, `Data ${JSON.stringify(req.body)}`);
		return res.status(500).send({ success: false, message: 'Error creating order' });
	}
};

exports.list = async function (req, res) {
	try {
		let whereClasue = {
			UserId: res.locals.user.id
		};

		if (req.body.status) {
			whereClasue.status = req.body.status;
		}
		if (req.body.name) {
			whereClasue.name = req.body.name;
		}
		if (req.body.brand) {
			whereClasue.brand = req.body.brand;
		}
		if (req.body.date) {
			whereClasue.date = {
				$gte: req.body.startDate,
				$lte: req.body.endDate
			}
		}
		const orders = await Orders.find(whereClasue).sort({ createdAt: -1 });

		return res.status(200).send({ success: true, results: orders });

	} catch (err) {
		console.log(`api/orders/list`, err);
		logger.RaiseLogEvent('api/orders/list', 'error', err, `Data ${JSON.stringify(req.body)}`);
		return res.send({ success: false, message: 'Error fetching order' });
	}
}