// Đóng/mở form địa chỉ - kiểm tra tồn tại phần tử
const adressbtn = document.querySelector('#adress-from');
const adressclose = document.querySelector('#adress-close');

if (adressbtn) {
  adressbtn.addEventListener("click", function () {
    const adressForm = document.querySelector('.adress-from');
    if (adressForm) {
      adressForm.style.display = "flex";
    }
  });
}

if (adressclose) {
  adressclose.addEventListener("click", function () {
    const adressForm = document.querySelector('.adress-from');
    if (adressForm) {
      adressForm.style.display = "none";
    }
  });
}

// ========== SLIDER CHÍNH (banner) ==========
const rightbtn = document.querySelector('.slider-main-right');
const leftbtn = document.querySelector('.slider-main-left');
const imgNumber = document.querySelectorAll('.slider-content-left-top img');
const imgNumberLi = document.querySelectorAll('.slider-content-left-bottom .tab');
const sliderWrapper = document.querySelector('.slider-content-left-top');

if (rightbtn && leftbtn && sliderWrapper && imgNumber.length > 0) {
  let indexMain = 0;

  function showSlide(index) {
    sliderWrapper.style.right = index * 100 + "%";
    updateActiveLi(index);
  }

  function updateActiveLi(activeIndex) {
    imgNumberLi.forEach((li, i) => {
      li.classList.toggle('active', i === activeIndex);
    });
  }

  rightbtn.addEventListener("click", function () {
    indexMain++;
    if (indexMain > imgNumber.length - 1) {
      indexMain = 0;
    }
    showSlide(indexMain);
  });

  leftbtn.addEventListener("click", function () {
    indexMain--;
    if (indexMain < 0) {
      indexMain = imgNumber.length - 1;
    }
    showSlide(indexMain);
  });

  imgNumberLi.forEach(function (tab, liIndex) {
    tab.addEventListener("click", function () {
      indexMain = liIndex;
      showSlide(indexMain);
    });
  });

  // Auto slide
  setInterval(function () {
    indexMain++;
    if (indexMain > imgNumber.length - 1) {
      indexMain = 0;
    }
    showSlide(indexMain);
  }, 3000);
}

// ========== Tính % giảm giá ==========
document.querySelectorAll('.slider-product-one-content-item').forEach(item => {
  const originalEl = item.querySelector('.original-price');
  const currentEl = item.querySelector('.current-price');
  const discountEl = item.querySelector('.discount-percent');

  if (originalEl && currentEl && discountEl) {
    const originalText = originalEl.textContent.replace(/[₫,.]/g, '').trim();
    const currentText = currentEl.textContent.replace(/[₫,.]/g, '').trim();

    const original = parseFloat(originalText);
    const current = parseFloat(currentText);

    if (!isNaN(original) && !isNaN(current) && original > current) {
      const discount = Math.round(((original - current) / original) * 100);
      discountEl.textContent = `Giảm ${discount}%`;
    } else {
      discountEl.textContent = "";
    }
  }
});

// ========== Đếm ngược khuyến mãi ==========
// Thời gian kết thúc (ví dụ: 23h59 phút hôm nay)
const endTime = new Date();
endTime.setHours(23, 59, 59, 0);
const timeElement = document.getElementById("time");

if (timeElement) {
  function updateCountdown() {
    const now = new Date();
    const distance = endTime - now;

    if (distance <= 0) {
      timeElement.innerHTML = "00:00:00";
      clearInterval(timer);
      return;
    }

    const hours = String(Math.floor((distance / (1000 * 60 * 60)) % 24)).padStart(2, '0');
    const minutes = String(Math.floor((distance / (1000 * 60)) % 60)).padStart(2, '0');
    const seconds = String(Math.floor((distance / 1000) % 60)).padStart(2, '0');

    timeElement.innerHTML = `${hours}:${minutes}:${seconds}`;
  }

  const timer = setInterval(updateCountdown, 1000);
  updateCountdown(); // Gọi ngay khi load
}

// ========== Product Gallery Two Slider ==========
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const slider = document.querySelector('.product-gallery-two-content-left-bottom');

if (prevBtn && nextBtn && slider) {
  // Nút cuộn
  prevBtn.addEventListener('click', () => {
    slider.scrollBy({ left: -220, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    slider.scrollBy({ left: 220, behavior: 'smooth' });
  });

  // Auto slide
  setInterval(() => {
    if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth) {
      slider.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      slider.scrollBy({ left: 220, behavior: 'smooth' });
    }
  }, 3000); 
}

// ========== Banner Three Slider ==========
(function () {
  const sliderThree = document.querySelector('.slider-three');
  if (!sliderThree) return;

  const slides = document.querySelectorAll('.slide-three');
  if (slides.length === 0) return;

  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  if (!prevBtn || !nextBtn) return;

  let currentIndex = 0;
  const slideWidth = slides[0].offsetWidth + 20;
  let autoSlideInterval;

  function updateSliderPosition() {
    sliderThree.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  }

  function moveSlide(step) {
    currentIndex += step;
    const maxIndex = slides.length - 2; // Hiển thị 2 slide cùng lúc
    if (currentIndex < 0) currentIndex = maxIndex;
    if (currentIndex > maxIndex) currentIndex = 0;
    updateSliderPosition();
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(() => moveSlide(1), 5000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  prevBtn.addEventListener('click', () => {
    stopAutoSlide();
    moveSlide(-1);
    setTimeout(startAutoSlide, 3000);
  });

  nextBtn.addEventListener('click', () => {
    stopAutoSlide();
    moveSlide(1);
    setTimeout(startAutoSlide, 3000);
  });

  // Khởi động auto slide
  window.addEventListener('load', () => {
    sliderThree.style.transition = 'transform 0.5s ease-in-out';
    startAutoSlide();
  });
})();

// ========== Tab Gallery Product ==========
const tabs = document.querySelectorAll('.tab');
if (tabs.length > 0) {
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
  
  // Active tab đầu tiên
  if (!tabs[0].classList.contains('active')) {
    tabs[0].classList.add('active');
  }
}

// ========== Tính năng tìm kiếm ==========
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');

if (searchInput && searchBtn) {
  // Tạo danh sách sản phẩm mẫu để tìm kiếm
  const products = [
    { id: 1, name: 'iPhone 16 Pro Max', category: 'Điện thoại', price: '34.990.000₫' },
    { id: 2, name: 'Samsung Galaxy S25 Ultra', category: 'Điện thoại', price: '32.990.000₫' },
    { id: 3, name: 'iPhone 16', category: 'Điện thoại', price: '24.990.000₫' },
    { id: 4, name: 'Xiaomi 14 Pro', category: 'Điện thoại', price: '19.990.000₫' },
    { id: 5, name: 'OPPO Reno 13', category: 'Điện thoại', price: '16.990.000₫' },
    { id: 6, name: 'MacBook Pro M3', category: 'Laptop', price: '48.990.000₫' },
    { id: 7, name: 'Dell XPS 15', category: 'Laptop', price: '35.990.000₫' },
    { id: 8, name: 'iPad Pro 2024', category: 'Tablet', price: '28.990.000₫' },
    { id: 9, name: 'Samsung Galaxy Tab S9', category: 'Tablet', price: '22.990.000₫' },
    { id: 10, name: 'Apple Watch Ultra 2', category: 'Đồng hồ', price: '19.990.000₫' },
  ];

  function displaySearchResults(results) {
    if (!searchResults) return;
    
    if (results.length === 0) {
      searchResults.innerHTML = '<li style="padding: 8px; color: #666;">Không tìm thấy sản phẩm</li>';
      return;
    }

    let html = '';
    results.slice(0, 5).forEach(product => {
      html += `
        <li style="padding: 8px; border-bottom: 1px solid #eee; cursor: pointer;">
          <strong>${product.name}</strong> - ${product.price}
          <div style="font-size: 12px; color: #666;">${product.category}</div>
        </li>
      `;
    });
    
    searchResults.innerHTML = html;
    
    // Thêm sự kiện click cho từng kết quả
    searchResults.querySelectorAll('li').forEach((item, index) => {
      item.addEventListener('click', () => {
        window.location.href = `SanPham/SanPham${results[index].id}.html`;
      });
    });
  }

  function searchProducts(query) {
    if (!query) {
      searchResults.innerHTML = '';
      return;
    }
    
    const results = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );
    
    displaySearchResults(results);
  }

  // Sự kiện tìm kiếm
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `products.html?q=${encodeURIComponent(query)}`;
    }
  });

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    searchProducts(query);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `products.html?q=${encodeURIComponent(query)}`;
      }
    }
  });

  // Ẩn kết quả khi click ra ngoài
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.innerHTML = '';
    }
  });
}

// ========== Quản lý sản phẩm shop ==========
function renderShopProducts() {
  const shopList = document.getElementById("shop-product-list");
  if (!shopList) return;
  
  // Dữ liệu mẫu nếu chưa có trong localStorage
  let shopProducts = JSON.parse(localStorage.getItem("shopProducts")) || [
    {
      id: 1,
      name: "iPhone 16 Pro",
      price: 34990000,
      discount: 5,
      description: "Siêu phẩm flagship với camera đột phá",
      image: "image/phone1.jpg"
    },
    {
      id: 2,
      name: "Samsung Galaxy S25",
      price: 29990000,
      discount: 8,
      description: "Đẳng cấp công nghệ AI và màn hình xuất sắc",
      image: "image/phone2.jpg"
    },
    {
      id: 3,
      name: "OPPO Reno 13",
      price: 16990000,
      discount: 10,
      description: "Thiết kế tinh tế, camera xuất sắc",
      image: "image/phone4.jpg"
    },
    {
      id: 4,
      name: "Xiaomi 14 Pro",
      price: 19990000,
      discount: 7,
      description: "Hiệu năng mạnh mẽ, pin bền bỉ",
      image: "image/phone5.jpg"
    }
  ];
  
  // Lưu dữ liệu mẫu vào localStorage nếu đây là lần đầu
  if (!localStorage.getItem("shopProducts")) {
    localStorage.setItem("shopProducts", JSON.stringify(shopProducts));
  }

  shopList.innerHTML = "";
  
  if (shopProducts.length === 0) {
    shopList.innerHTML = "<p style='text-align: center; padding: 20px;'>Chưa có sản phẩm nào trong Shop.</p>";
    return;
  }
  
  // Tạo container grid cho sản phẩm
  const container = document.createElement("div");
  container.className = "shop-products-grid";
  
  shopProducts.forEach(p => {
    const finalPrice = p.discount ? p.price * (1 - p.discount / 100) : p.price;
    const productCard = document.createElement("div");
    productCard.className = "shop-product-card";
    productCard.innerHTML = `
      <div class="product-image">
        <img src="${p.image || 'https://via.placeholder.com/150'}" alt="${p.name}" style="width:100%;height:180px;object-fit:cover;">
      </div>
      <div class="product-info">
        <h4>${p.name}</h4>
        <p class="product-desc">${p.description}</p>
        <div class="price-wrap">
          ${p.discount ? 
            `<p class="original-price">${p.price.toLocaleString('vi')} đ</p>
             <p class="current-price">${Math.round(finalPrice).toLocaleString('vi')} đ</p>
             <p class="discount-percent">Giảm ${p.discount}%</p>` : 
            `<p class="current-price">${p.price.toLocaleString('vi')} đ</p>`
          }
        </div>
        <button class="add-to-cart">Thêm vào giỏ</button>
      </div>
    `;
    container.appendChild(productCard);
    
    // Sự kiện thêm vào giỏ
    productCard.querySelector('.add-to-cart').addEventListener('click', () => {
      addToCart(p);
      alert(`Đã thêm "${p.name}" vào giỏ hàng!`);
    });
  });
  
  shopList.appendChild(container);
}

function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Kiểm tra xem sản phẩm đã có trong giỏ chưa
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
      finalPrice: product.discount ? product.price * (1 - product.discount / 100) : product.price
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Cập nhật số lượng giỏ hàng trên header
  updateCartCount();
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  
  // Tìm và cập nhật số lượng trên icon giỏ hàng
  const cartButton = document.querySelector('.cart-button');
  if (cartButton && cartCount > 0) {
    let badge = cartButton.querySelector('.cart-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-badge';
      badge.style.backgroundColor = '#e53935';
      badge.style.color = 'white';
      badge.style.borderRadius = '50%';
      badge.style.width = '20px';
      badge.style.height = '20px';
      badge.style.display = 'flex';
      badge.style.alignItems = 'center';
      badge.style.justifyContent = 'center';
      badge.style.fontSize = '12px';
      badge.style.position = 'absolute';
      badge.style.top = '-8px';
      badge.style.right = '-8px';
      cartButton.style.position = 'relative';
      cartButton.appendChild(badge);
    }
    badge.textContent = cartCount;
  }
}

// Khởi tạo khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", function() {
  renderShopProducts();
  updateCartCount();
  
  // Thông báo thanh toán bị hủy
  const params = new URLSearchParams(window.location.search);
  const errorCode = params.get("errorCode");
  if (errorCode && errorCode !== "0") {
    alert("Giao dịch đã bị hủy hoặc thất bại.");
  }
});