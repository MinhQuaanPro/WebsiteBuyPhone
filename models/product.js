const mongoose = require("mongoose");

// module.exports = mongoose.model("Product", {
//     name: String,
//     price: Number,
//     image: String
// });


const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,        // ← bắt buộc
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: "https://via.placeholder.com/80"
  }
});

module.exports = mongoose.model("Product", productSchema);