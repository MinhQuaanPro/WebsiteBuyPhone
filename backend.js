const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors({ origin: '*' }));
app.use(express.static('public'));

const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));
const orderDetails = JSON.parse(fs.readFileSync('./data/orderDetail.json', 'utf8'));

app.get('/api/top-products', (req, res) => {
  const n = parseInt(req.query.n) || 10;
  const categoryFilter = req.query.category;
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

  const productSalesMap = {};

  orderDetails.forEach(order => {
    const orderDate = new Date(order.orderDate || order.date); // đồng bộ trường ngày
    if ((startDate && orderDate < startDate) || (endDate && orderDate > endDate)) return;

    const productId = order.productId;
    const quantity = order.quantity;
    productSalesMap[productId] = (productSalesMap[productId] || 0) + quantity;
  });

  let result = Object.entries(productSalesMap)
    .map(([id, quantity]) => {
      const product = products.find(p => p.id === parseInt(id));
      if (!product) return null;
      if (categoryFilter && product.category !== categoryFilter) return null;
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        image: product.image || 'default.jpg',
        quantitySold: quantity
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, n);

  res.json(result);
});

app.listen(port, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${port}`);
});
