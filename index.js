const express = require('express');
const bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true, parameterLimit: 10000 }));


app.use('/api/users', require('./routes/api/User'));
app.use('/api/products', require('./routes/api/Product'));
app.use('/api/orders', require('./routes/api/Order'));


app.use((err, req, res, next) => {
	res.status(500).send({ error: err.message });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;