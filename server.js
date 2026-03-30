const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const axios = require("axios");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");



// Models
const Product = require("./models/product");
const User = require("./models/user");

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));


const SECRET = "mySecretKey123";
const PORT = 3000;

// ========== DATABASE CONNECTION ==========
mongoose.connect("mongodb://localhost:27017/shop", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ Kết nối MongoDB thành công"))
  .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));

// ========== MIDDLEWARE ==========
function auth(req, res, next) {
  const token = req.headers.token || req.query.token;
  if (!token) return res.status(401).json("Không có token");

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Lỗi xác thực token:", err);
    return res.status(403).json("Token không hợp lệ");
  }
}

// ========== USER APIs ==========
// Tạo tài khoản admin mặc định
app.get("/api/create-admin", async (req, res) => {
  try {
    const exists = await User.findOne({ username: "admin" });
    if (exists) return res.json("Admin đã tồn tại");

    const hash = await bcrypt.hash("123456", 10);
    await User.create({ username: "admin", password: hash, role: "admin" });

    res.json("Tạo admin thành công (user: admin / pass: 123456)");
  } catch (err) {
    res.status(500).json("Lỗi khi tạo admin");
  }     
});

// Đăng ký tài khoản
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const existUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existUser) {
      return res.status(400).json({ message: 'Email hoặc tên người dùng đã được đăng ký' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword, role: "user" });
    
    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// Đăng nhập
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json("Sai tài khoản");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json("Sai mật khẩu");

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        role: user.role,
        email: user.email 
      } 
    });
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    res.status(500).json("Lỗi hệ thống");
  }
});

// ========== PRODUCT APIs ==========
// Lấy tất cả sản phẩm
app.get("/api/products", async (req, res) => {
  try {
    res.json(await Product.find());
  } catch (err) {
    res.status(500).json("Lỗi khi lấy sản phẩm");
  }
});

// Thêm sản phẩm (chỉ admin)
app.post("/api/products", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json("Không có quyền");
    const product = await Product.create(req.body);
    res.json(product);
  } catch (err) {
    res.status(500).json("Lỗi khi thêm sản phẩm");
  }
});

// Sửa sản phẩm (chỉ admin)
app.put("/api/products/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json("Không có quyền");
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json("Lỗi khi sửa sản phẩm");
  }
});

// Xóa sản phẩm (chỉ admin)
app.delete("/api/products/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json("Không có quyền");
    await Product.findByIdAndDelete(req.params.id);
    res.json("Đã xóa");
  } catch (err) {
    res.status(500).json("Lỗi khi xóa sản phẩm");
  }
});

// Tìm kiếm sản phẩm
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase();
    if (!query) {
      return res.status(400).json({ count: 0, results: [] });
    }
    
    const results = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });
    
    res.json({ 
      count: results.length, 
      results 
    });
  } catch (err) {
    console.error("Lỗi tìm kiếm:", err);
    res.status(500).json({ error: "Lỗi khi tìm kiếm sản phẩm" });
  }
});

// Lấy top sản phẩm bán chạy
app.get("/api/top-products", async (req, res) => {
  try {
    const n = parseInt(req.query.n) || 10;
    const categoryFilter = req.query.category;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Trong thực tế, bạn nên có model OrderDetail
    // Đây là ví dụ sử dụng dữ liệu mẫu
    let orderDetails = [];
    let products = await Product.find();

    // Giả lập dữ liệu đơn hàng nếu cần
    if (fs.existsSync('./data/orderDetail.json')) {
      try {
        orderDetails = JSON.parse(fs.readFileSync('./data/orderDetail.json', 'utf8'));
      } catch (err) {
        console.warn("Không đọc được file orderDetail.json, sử dụng dữ liệu mẫu");
      }
    }

    // Tạo dữ liệu mẫu nếu không có file
    if (orderDetails.length === 0) {
      orderDetails = Array.from({ length: 50 }, (_, i) => ({
        orderId: i + 1,
        productId: Math.floor(Math.random() * products.length) + 1,
        quantity: Math.floor(Math.random() * 5) + 1,
        orderDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      }));
    }

    const productSalesMap = {};
    const productIdMap = {};

    // Map product ID với index trong MongoDB
    products.forEach(product => {
      productIdMap[product._id.toString()] = product.id;
    });

    orderDetails.forEach(order => {
      const orderDate = new Date(order.orderDate || order.date);
      if ((startDate && orderDate < startDate) || (endDate && orderDate > endDate)) return;

      const productId = order.productId;
      const quantity = order.quantity;
      productSalesMap[productId] = (productSalesMap[productId] || 0) + quantity;
    });

    const result = Object.entries(productSalesMap)
      .map(([id, quantity]) => {
        const product = products.find(p => parseInt(productIdMap[p._id.toString()]) === parseInt(id));
        if (!product) return null;
        if (categoryFilter && product.category !== categoryFilter) return null;
        return {
          id: product._id,
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
  } catch (err) {
    console.error("Lỗi trong /api/top-products:", err);
    res.status(500).json({ error: 'Lỗi khi lấy dữ liệu sản phẩm bán chạy' });
  }
});

// ========== PAYMENT APIs ==========
// Tạo thanh toán MoMo
app.post("/api/create-payment", async (req, res) => {
  try {
    const { amount, orderId, orderInfo, redirectUrl } = req.body;
    
    const partnerCode = "MOMO";
    const accessKey = "F8BBA842ECF85";
    const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    const requestId = `${Date.now()}`;
    const ipnUrl = `${req.protocol}://${req.get('host')}/api/ipn`;
    const requestType = "captureWallet";
    const extraData = "";

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl || 'http://localhost:3000/success.html'}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount: amount.toString(),
      orderId,
      orderInfo,
      redirectUrl: redirectUrl || 'http://localhost:3000/success.html',
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi"
    };

    const momoRes = await axios.post("https://test-payment.momo.vn/v2/gateway/api/create", requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    res.json({ payUrl: momoRes.data.payUrl });
  } catch (err) {
    console.error("Lỗi tạo thanh toán MoMo:", err.response?.data || err.message);
    res.status(500).json({ error: "Không thể tạo thanh toán MoMo" });
  }
});

// Webhook IPN từ MoMo
app.post("/api/ipn", (req, res) => {
  console.log("Nhận thông báo từ MoMo:", req.body);
  // Xử lý logic xác nhận đơn hàng
  res.status(200).json({ status: "success" });
});

// ========== SAMPLE DATA GENERATION ==========
app.get("/api/create-sample-products", async (req, res) => {
  try {
    const sample = [
      // iPhone
      { name: "iPhone 15", price: 23000000, image: "https://image.anhducdigital.vn/apple/iphone/iphone-15-15plus/iphone-15-2-1-500x500.png", category: "phone", description: "iPhone 15 chính hãng" },
      { name: "iPhone 15 Plus", price: 26000000, image: "https://image.anhducdigital.vn/apple/iphone/iphone-15-15plus/iphone-15-2-1-500x500.png", category: "phone", description: "iPhone 15 Plus chính hãng" },
      { name: "iPhone 15 Pro", price: 29000000, image: "https://placehold.co/200", category: "phone", description: "iPhone 15 Pro cao cấp" },
      { name: "iPhone 15 Pro Max", price: 34000000, image: "https://placehold.co/200", category: "phone", description: "iPhone 15 Pro Max cao cấp nhất" },

      // Samsung
      { name: "Samsung S24", price: 21000000, image: "https://placehold.co/200", category: "phone", description: "Samsung Galaxy S24" },
      { name: "Samsung S24 Ultra", price: 28000000, image: "https://placehold.co/200", category: "phone", description: "Samsung Galaxy S24 Ultra" },
      { name: "Samsung A55", price: 9500000, image: "https://placehold.co/200", category: "phone", description: "Samsung Galaxy A55" },
      { name: "Samsung Z Fold 5", price: 36000000, image: "https://placehold.co/200", category: "phone", description: "Samsung Galaxy Z Fold 5" },

      // Xiaomi
      { name: "Xiaomi 14", price: 19000000, image: "https://placehold.co/200", category: "phone", description: "Xiaomi 14 cao cấp" },
      { name: "Xiaomi Redmi Note 13", price: 5500000, image: "https://placehold.co/200", category: "phone", description: "Xiaomi Redmi Note 13" },

      // Oppo
      { name: "Oppo Reno 11", price: 10500000, image: "https://placehold.co/200", category: "phone", description: "Oppo Reno 11" },
      { name: "Oppo Find X7", price: 18500000, image: "https://placehold.co/200", category: "phone", description: "Oppo Find X7 cao cấp" },

      // Vivo
      { name: "Vivo V30", price: 8900000, image: "https://placehold.co/200", category: "phone", description: "Vivo V30" },
      { name: "Vivo Y36", price: 4900000, image: "https://placehold.co/200", category: "phone", description: "Vivo Y36" },

      // Realme
      { name: "Realme 11 Pro", price: 7500000, image: "https://placehold.co/200", category: "phone", description: "Realme 11 Pro" },
      { name: "Realme C55", price: 4500000, image: "https://placehold.co/200", category: "phone", description: "Realme C55" },

      // Gaming Phone
      { name: "ROG Phone 7", price: 27000000, image: "https://placehold.co/200", category: "phone", description: "ROG Phone 7" },
      { name: "Black Shark 6", price: 24000000, image: "https://placehold.co/200", category: "phone", description: "Black Shark 6" },

      // Khác
      { name: "Nokia X30", price: 8900000, image: "https://placehold.co/200", category: "phone", description: "Nokia X30" },
      { name: "Tecno Pova 5", price: 4500000, image: "https://placehold.co/200", category: "phone", description: "Tecno Pova 5" },
      { name: "Infinix Hot 40", price: 3500000, image: "https://placehold.co/200", category: "phone", description: "Infinix Hot 40" },
      { name: "Google Pixel 7", price: 16500000, image: "https://placehold.co/200", category: "phone", description: "Google Pixel 7" },
      { name: "Google Pixel 8 Pro", price: 25000000, image: "https://placehold.co/200", category: "phone", description: "Google Pixel 8 Pro" }
    ];

    await Product.deleteMany({});
    await Product.insertMany(sample);
    res.json(`✅ Đã tạo dữ liệu mẫu (25 sản phẩm)!`);
  } catch (err) {
    console.error("Lỗi tạo dữ liệu mẫu:", err);
    res.status(500).json("Lỗi khi tạo dữ liệu mẫu");
  }
});

// ========== STATIC FILES & DEFAULT ROUTES ==========
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});


// ========== AI CHAT (GEMINI) ==========
const GEMINI_API_KEY = "AIzaSyDdMv0zv6UQ6iFhG9kXZ8JyK7Z7Y7X7Y7";
app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("🔍 Gemini raw:", JSON.stringify(data, null, 2));

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.json({
        reply: "❌ Gemini không trả nội dung (bị filter)"
      });
    }

    res.json({ reply: text });

  } catch (err) {
    console.error("❌ Gemini error:", err);
    res.status(500).json({ reply: "❌ Lỗi AI server" });
  }
});


// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`🔗 MongoDB URI: mongodb://localhost:27017/shop`);
  console.log(`🔧 API Endpoints:`);
  console.log(`   - Đăng ký: POST /api/register`);
  console.log(`   - Đăng nhập: POST /api/login`);
  console.log(`   - Sản phẩm: GET /api/products`);
  console.log(`   - Tìm kiếm: GET /api/search?q=...`);
  console.log(`   - Thanh toán: POST /api/create-payment`);
  console.log(`   - Dữ liệu mẫu: GET /api/create-sample-products`);
});



// Kiểm tra voucher
app.post('/api/vouchers/validate', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const voucher = await Voucher.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher không tồn tại hoặc đã hết hạn' });
    }
    
    const today = new Date();
    if (voucher.expiryDate < today) {
      return res.status(400).json({ error: 'Voucher đã hết hạn' });
    }
    
    if (voucher.usageCount >= voucher.usageLimit) {
      return res.status(400).json({ error: 'Voucher đã hết lượt sử dụng' });
    }
    
    // Kiểm tra đơn hàng tối thiểu (nếu có)
    const { cartTotal } = req.body;
    if (cartTotal < voucher.minOrderValue) {
      return res.status(400).json({ 
        error: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}đ để sử dụng voucher này` 
      });
    }
    
    res.json({
      valid: true,
      voucher: {
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        maxDiscount: voucher.maxDiscount,
        description: voucher.description,
        expiryDate: voucher.expiryDate,
        minOrderValue: voucher.minOrderValue
      }
    });
  } catch (error) {
    console.error('Lỗi khi kiểm tra voucher:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

// Áp dụng voucher
app.post('/api/vouchers/apply', auth, async (req, res) => {
  try {
    const { code, cartTotal, userId } = req.body;
    const voucher = await Voucher.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher không tồn tại hoặc đã hết hạn' });
    }
    
    // Kiểm tra các điều kiện
    const today = new Date();
    if (voucher.expiryDate < today) {
      return res.status(400).json({ error: 'Voucher đã hết hạn' });
    }
    
    if (voucher.usageCount >= voucher.usageLimit) {
      return res.status(400).json({ error: 'Voucher đã hết lượt sử dụng' });
    }
    
    if (cartTotal < voucher.minOrderValue) {
      return res.status(400).json({ 
        error: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}đ để sử dụng voucher này` 
      });
    }
    
    // Tính giảm giá
    let discount = 0;
    if (voucher.type === 'fixed') {
      discount = voucher.value;
    } else if (voucher.type === 'percentage') {
      discount = (cartTotal * voucher.value) / 100;
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    }
    
    // Cập nhật lượt sử dụng
    voucher.usageCount += 1;
    await voucher.save();
    
    // Lưu vào lịch sử
    await VoucherHistory.create({
      userId,
      voucherId: voucher._id,
      code: voucher.code,
      value: discount,
      cartTotal,
      appliedAt: new Date()
    });
    
    res.json({
      success: true,
      discount,
      voucher: {
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        maxDiscount: voucher.maxDiscount,
        description: voucher.description,
        expiryDate: voucher.expiryDate
      }
    });
  } catch (error) {
    console.error('Lỗi khi áp dụng voucher:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

// Lấy lịch sử voucher của user
app.get('/api/vouchers/history', auth, async (req, res) => {
  try {
    const history = await VoucherHistory.find({ userId: req.user.id })
      .sort({ appliedAt: -1 })
      .populate('voucherId', 'code description');
    
    res.json(history);
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử voucher:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

// Kiểm tra voucher
app.post('/api/vouchers/validate', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const voucher = await Voucher.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher không tồn tại hoặc đã hết hạn' });
    }
    
    const today = new Date();
    if (voucher.expiryDate < today) {
      return res.status(400).json({ error: 'Voucher đã hết hạn' });
    }
    
    if (voucher.usageCount >= voucher.usageLimit) {
      return res.status(400).json({ error: 'Voucher đã hết lượt sử dụng' });
    }
    
    // Kiểm tra đơn hàng tối thiểu (nếu có)
    const { cartTotal } = req.body;
    if (cartTotal < voucher.minOrderValue) {
      return res.status(400).json({ 
        error: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}đ để sử dụng voucher này` 
      });
    }
    
    res.json({
      valid: true,
      voucher: {
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        maxDiscount: voucher.maxDiscount,
        description: voucher.description,
        expiryDate: voucher.expiryDate,
        minOrderValue: voucher.minOrderValue
      }
    });
  } catch (error) {
    console.error('Lỗi khi kiểm tra voucher:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

// Áp dụng voucher
app.post('/api/vouchers/apply', auth, async (req, res) => {
  try {
    const { code, cartTotal, userId } = req.body;
    const voucher = await Voucher.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher không tồn tại hoặc đã hết hạn' });
    }
    
    // Kiểm tra các điều kiện
    const today = new Date();
    if (voucher.expiryDate < today) {
      return res.status(400).json({ error: 'Voucher đã hết hạn' });
    }
    
    if (voucher.usageCount >= voucher.usageLimit) {
      return res.status(400).json({ error: 'Voucher đã hết lượt sử dụng' });
    }
    
    if (cartTotal < voucher.minOrderValue) {
      return res.status(400).json({ 
        error: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}đ để sử dụng voucher này` 
      });
    }
    
    // Tính giảm giá
    let discount = 0;
    if (voucher.type === 'fixed') {
      discount = voucher.value;
    } else if (voucher.type === 'percentage') {
      discount = (cartTotal * voucher.value) / 100;
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    }
    
    // Cập nhật lượt sử dụng
    voucher.usageCount += 1;
    await voucher.save();
    
    // Lưu vào lịch sử
    await VoucherHistory.create({
      userId,
      voucherId: voucher._id,
      code: voucher.code,
      value: discount,
      cartTotal,
      appliedAt: new Date()
    });
    
    res.json({
      success: true,
      discount,
      voucher: {
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        maxDiscount: voucher.maxDiscount,
        description: voucher.description,
        expiryDate: voucher.expiryDate
      }
    });
  } catch (error) {
    console.error('Lỗi khi áp dụng voucher:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

// Lấy lịch sử voucher của user
app.get('/api/vouchers/history', auth, async (req, res) => {
  try {
    const history = await VoucherHistory.find({ userId: req.user.id })
      .sort({ appliedAt: -1 })
      .populate('voucherId', 'code description');
    
    res.json(history);
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử voucher:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});