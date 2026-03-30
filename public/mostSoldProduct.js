const fs = require('fs');

// Đọc dữ liệu từ file
const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));
const orderDetails = JSON.parse(fs.readFileSync('./data/orderDetail.json', 'utf8'));

// Tạo map để thống kê tổng quantity theo productId
const productSalesMap = {};

orderDetails.forEach(order => {
  const productId = order.productId;
  const quantity = order.quantity;

  if (productSalesMap[productId]) {
    productSalesMap[productId] += quantity;
  } else {
    productSalesMap[productId] = quantity;
  }
});

// Tìm sản phẩm có số lượng bán nhiều nhất
let maxProductId = null;
let maxQuantity = 0;

for (const productId in productSalesMap) {
  if (productSalesMap[productId] > maxQuantity) {
    maxQuantity = productSalesMap[productId];
    maxProductId = productId;
  }
}

// Lấy thông tin sản phẩm
const mostSoldProduct = products.find(p => p.id === parseInt(maxProductId));

if (mostSoldProduct) {
  console.log("=== Sản phẩm bán chạy nhất ===");
  console.log(`Tên sản phẩm: ${mostSoldProduct.name}`);
  console.log(`Loại: ${mostSoldProduct.category}`);
  console.log(`Số lượng đã bán: ${maxQuantity}`);
} else {
  console.log("Không tìm thấy sản phẩm phù hợp.");
}
