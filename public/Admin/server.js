const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Product = require("./models/product");
const User = require("./models/user");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const SECRET = "mySecretKey123";

// Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/shop", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Middleware xác thực token
function auth(req, res, next) {
    const token = req.headers.token;
    if (!token) return res.status(401).json("Không có token");

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(403).json("Token không hợp lệ");
    }
}

// ---------- USER APIs ---------- //
app.get("/api/create-admin", async (req, res) => {
    const exists = await User.findOne({ username: "admin" });
    if (exists) return res.json("Admin đã tồn tại");

    const hash = await bcrypt.hash("123456", 10);
    await User.create({ username: "admin", password: hash, role: "admin" });
    res.json("Tạo admin thành công (user: admin / pass: 123456)");
});

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json("Sai tài khoản");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json("Sai mật khẩu");

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET);
    res.json({ token });
});

// ---------- PRODUCT CRUD ---------- //
// Lấy tất cả sản phẩm — KHÔNG cần auth để xem (có thể thêm auth nếu muốn)
app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json("Lỗi khi lấy sản phẩm");
    }
});

// Thêm sản phẩm — chỉ admin
app.post("/api/products", auth, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json("Không có quyền");
    }
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json("Dữ liệu không hợp lệ");
    }
});

// Cập nhật sản phẩm — chỉ admin
app.put("/api/products/:id", auth, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json("Không có quyền");
    }

    const { name, price, image } = req.body;

    if (!name || price == null || !image) {
        return res.status(400).json("Vui lòng điền đầy đủ: tên, giá, ảnh");
    }

    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { name, price: Number(price), image },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json("Không tìm thấy sản phẩm");
        }

        res.json(updated);
    } catch (err) {
        console.error("Lỗi cập nhật:", err);
        res.status(400).json("Dữ liệu không hợp lệ hoặc trùng lặp");
    }
});

// Xóa sản phẩm — chỉ admin
app.delete("/api/products/:id", auth, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json("Không có quyền");
    }

    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json("Không tìm thấy sản phẩm");
        res.json("Đã xóa");
    } catch (err) {
        res.status(500).json("Lỗi khi xóa");
    }
});

app.listen(3000, () => console.log("Server chạy tại http://localhost:3000"));

app.get("/api/create-sample-products", async (req, res) => {
    const sample = [
        // iPhone
        { name: "iPhone 15", price: 23000000, image: "https://image.anhducdigital.vn/apple/iphone/iphone-15-15plus/iphone-15-2-1-500x500.png" },
        { name: "iPhone 15 Plus", price: 26000000, image: "https://image.anhducdigital.vn/apple/iphone/iphone-15-15plus/iphone-15-2-1-500x500.png" },
        { name: "iPhone 15 Pro", price: 29000000, image: "https://placehold.co/200" },
        { name: "iPhone 15 Pro Max", price: 34000000, image: "https://placehold.co/200" },

        // Samsung
        { name: "Samsung S24", price: 21000000, image: "https://placehold.co/200" },
        { name: "Samsung S24 Ultra", price: 28000000, image: "https://placehold.co/200" },
        { name: "Samsung A55", price: 9500000, image: "https://placehold.co/200" },
        { name: "Samsung Z Fold 5", price: 36000000, image: "https://placehold.co/200" },

        // Xiaomi
        { name: "Xiaomi 14", price: 19000000, image: "https://placehold.co/200" },
        { name: "Xiaomi Redmi Note 13", price: 5500000, image: "https://placehold.co/200" },

        // Oppo
        { name: "Oppo Reno 11", price: 10500000, image: "https://placehold.co/200" },
        { name: "Oppo Find X7", price: 18500000, image: "httpsplacehold.co/200" },

        // Vivo
        { name: "Vivo V30", price: 8900000, image: "https://placehold.co/200" },
        { name: "Vivo Y36", price: 4900000, image: "https://placehold.co/200" },

        // Realme
        { name: "Realme 11 Pro", price: 7500000, image: "https://placehold.co/200" },
        { name: "Realme C55", price: 4500000, image: "https://placehold.co/200" },

        // Gaming Phone
        { name: "ROG Phone 7", price: 27000000, image: "https://placehold.co/200" },
        { name: "Black Shark 6", price: 24000000, image: "https://placehold.co/200" },

        // Khác
        { name: "Nokia X30", price: 8900000, image: "https://placehold.co/200" },
        { name: "Tecno Pova 5", price: 4500000, image: "https://placehold.co/200" },
        { name: "Infinix Hot 40", price: 3500000, image: "https://placehold.co/200" },
        { name: "Google Pixel 7", price: 16500000, image: "https://placehold.co/200" },
        { name: "Google Pixel 8 Pro", price: 25000000, image: "https://placehold.co/200" }
    ];

    await Product.insertMany(sample);
    res.json("Đã tạo dữ liệu mẫu (25 sản phẩm)!");
});
