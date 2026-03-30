// // voucher.js - Dùng chung cho cả 2 trang
// class VoucherSystem {
//   constructor() {
//     this.currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
//     this.users = JSON.parse(localStorage.getItem("users")) || [];
//     this.vouchers = [
//       { id: 1, name: "Giảm 50k", points: 50, desc: "Áp dụng cho đơn hàng từ 500k", icon: "💰" },
//       { id: 2, name: "Giảm 100k", points: 100, desc: "Áp dụng cho đơn hàng từ 1 triệu", icon: "🎁" },
//       { id: 3, name: "Free ship", points: 30, desc: "Miễn phí vận chuyển toàn quốc", icon: "🚚" },
//       { id: 4, name: "Tặng tai nghe", points: 200, desc: "Áp dụng khi mua điện thoại", icon: "🎧" },
//       { id: 5, name: "Giảm 10%", points: 150, desc: "Tối đa 200k cho đơn hàng tiếp theo", icon: "📉" }
//     ];
    
//     // Khởi tạo redeemedVouchers nếu chưa tồn tại
//     if (this.currentUser && !this.currentUser.redeemedVouchers) {
//       this.currentUser.redeemedVouchers = [];
//       localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
      
//       const index = this.users.findIndex(u => u.username === this.currentUser.username);
//       if (index >= 0) {
//         this.users[index] = this.currentUser;
//         localStorage.setItem("users", JSON.stringify(this.users));
//       }
//     }
//   }

//   // Kiểm tra đăng nhập
//   checkLogin() {
//     if (!this.currentUser) {
//       alert("Bạn cần đăng nhập trước!");
//       window.location = "index_user.html";
//       return false;
//     }
//     return true;
//   }

//   // Cập nhật dữ liệu người dùng
//   saveUserData() {
//     localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
    
//     const index = this.users.findIndex(u => u.username === this.currentUser.username);
//     if (index >= 0) {
//       this.users[index] = this.currentUser;
//       localStorage.setItem("users", JSON.stringify(this.users));
//     }
//   }

//   // Đổi voucher
//   redeemVoucher(voucherId) {
//     if (!this.currentUser) return false;
    
//     const voucher = this.vouchers.find(v => v.id === voucherId);
//     if (!voucher) return false;
    
//     // Kiểm tra điều kiện
//     if (this.currentUser.points < voucher.points) {
//       return { success: false, message: "Không đủ điểm để đổi voucher!" };
//     }
    
//     if (this.currentUser.redeemedVouchers.some(v => v.id === voucherId)) {
//       return { success: false, message: "Bạn đã đổi voucher này rồi!" };
//     }
    
//     // Cập nhật dữ liệu
//     this.currentUser.points -= voucher.points;
//     this.currentUser.redeemedVouchers.push({
//       id: voucher.id,
//       name: voucher.name,
//       points: voucher.points,
//       date: new Date().toISOString()
//     });
    
//     this.saveUserData();
//     return { 
//       success: true, 
//       message: `Đổi thành công ${voucher.icon} ${voucher.name}!`, 
//       remainingPoints: this.currentUser.points 
//     };
//   }

//   // Lấy danh sách voucher đã đổi
//   getRedeemedVouchers() {
//     return this.currentUser?.redeemedVouchers || [];
//   }

//   // Lấy voucher theo ID
//   getVoucherById(id) {
//     return this.vouchers.find(v => v.id === id);
//   }
// }

//new
// voucher.js
document.addEventListener('DOMContentLoaded', function() {
    const voucherCodeInput = document.getElementById('voucher-code');
    const applyVoucherBtn = document.querySelector('.apply-voucher-btn');
    const voucherList = document.querySelector('.voucher-list');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let appliedVouchers = JSON.parse(localStorage.getItem('appliedVouchers')) || [];

    // Hàm tính tổng tiền
    function calculateTotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Hàm tính giảm giá từ voucher
    function calculateTotalDiscount() {
        return appliedVouchers.reduce((sum, voucher) => {
            if (!voucher.used) return sum;
            
            if (voucher.type === 'percentage') {
                const subtotal = calculateTotal();
                return sum + Math.min((subtotal * voucher.value) / 100, voucher.maxDiscount || Infinity);
            } else if (voucher.type === 'fixed') {
                return sum + voucher.value;
            }
            return sum;
        }, 0);
    }

    // Hàm cập nhật tổng tiền
    function updateTotals() {
        const subtotal = calculateTotal();
        const discount = calculateTotalDiscount();
        const finalTotal = subtotal - discount;
        
        // Cập nhật giao diện
        document.querySelector('.temp-total').textContent = subtotal.toLocaleString('vi-VN') + 'đ';
        document.querySelector('.total-price').textContent = finalTotal.toLocaleString('vi-VN') + 'đ';
        
        // Hiển thị giảm giá
        const voucherSummary = document.querySelector('.summary-item.voucher-item');
        if (discount > 0) {
            if (!voucherSummary) {
                const voucherElement = document.createElement('div');
                voucherElement.className = 'summary-item voucher-item';
                voucherElement.innerHTML = `
                    <span>Giảm giá voucher:</span>
                    <span class="discount-amount">-${discount.toLocaleString('vi-VN')}đ</span>
                `;
                document.querySelector('.cart-summary').insertBefore(voucherElement, document.querySelector('.summary-total'));
            } else {
                voucherSummary.querySelector('.discount-amount').textContent = `-${discount.toLocaleString('vi-VN')}đ`;
            }
        } else if (voucherSummary) {
            voucherSummary.remove();
        }
    }

    // Hàm render voucher đã áp dụng
    function renderAppliedVouchers() {
        voucherList.innerHTML = '';
        
        if (appliedVouchers.length === 0) {
            voucherList.innerHTML = '<p style="color: #6c757d; text-align: center;">Chưa có voucher nào được áp dụng</p>';
            return;
        }
        
        appliedVouchers.forEach((voucher, index) => {
            const voucherElement = document.createElement('div');
            voucherElement.className = `voucher-item ${voucher.used ? '' : 'used'}`;
            voucherElement.innerHTML = `
                <div class="voucher-content">
                    <div>
                        <div class="voucher-name">${voucher.code}</div>
                        <div class="voucher-desc">${voucher.description}</div>
                    </div>
                    <div class="voucher-discount">
                        -${voucher.value}${voucher.type === 'percentage' ? '%' : 'đ'}
                    </div>
                </div>
                <button class="remove-voucher" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            voucherList.appendChild(voucherElement);
        });
        
        // Thêm sự kiện xóa voucher
        document.querySelectorAll('.remove-voucher').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                appliedVouchers[index].used = false;
                localStorage.setItem('appliedVouchers', JSON.stringify(appliedVouchers));
                renderAppliedVouchers();
                updateTotals();
                alert('Đã hủy áp dụng voucher này');
            });
        });
    }

    // Hàm áp dụng voucher
    function applyVoucher(code) {
        if (!code) {
            alert('Vui lòng nhập mã voucher');
            return;
        }
        
        code = code.trim().toUpperCase();
        
        // Kiểm tra voucher đã tồn tại
        const existingVoucher = appliedVouchers.find(v => v.code === code);
        if (existingVoucher && existingVoucher.used) {
            alert('Voucher này đã được áp dụng rồi!');
            return;
        }
        
        // Giả lập kiểm tra voucher (trong thực tế sẽ gọi API)
        const validVouchers = {
            'GIAM50K': {
                code: 'GIAM50K',
                value: 50000,
                type: 'fixed',
                description: 'Giảm 50.000đ cho đơn hàng từ 500.000đ',
                expiryDate: '2025-12-31'
            },
            'GIAM10PCT': {
                code: 'GIAM10PCT',
                value: 10,
                type: 'percentage',
                maxDiscount: 200000,
                description: 'Giảm 10% tối đa 200.000đ',
                expiryDate: '2025-12-31'
            },
            'FREESHIP': {
                code: 'FREESHIP',
                value: 30000,
                type: 'fixed',
                description: 'Miễn phí vận chuyển',
                expiryDate: '2025-12-31'
            }
        };
        
        const voucher = validVouchers[code];
        if (!voucher) {
            alert('Mã voucher không hợp lệ hoặc đã hết hạn!');
            return;
        }
        
        // Thêm/hoặc cập nhật voucher
        if (existingVoucher) {
            existingVoucher.used = true;
        } else {
            appliedVouchers.push({
                code: code,
                used: true,
                value: voucher.value,
                type: voucher.type,
                description: voucher.description,
                maxDiscount: voucher.maxDiscount,
                expiryDate: voucher.expiryDate
            });
        }
        
        // Lưu vào localStorage
        localStorage.setItem('appliedVouchers', JSON.stringify(appliedVouchers));
        
        // Cập nhật giao diện
        renderAppliedVouchers();
        updateTotals();
        
        // Reset input
        voucherCodeInput.value = '';
        
        alert(`✅ Áp dụng voucher thành công!\nGiảm giá: ${voucher.value}${voucher.type === 'percentage' ? '%' : 'đ'}`);
    }

    // Khởi tạo
    renderAppliedVouchers();
    updateTotals();
    
    // Xử lý sự kiện
    if (applyVoucherBtn) {
        applyVoucherBtn.addEventListener('click', function() {
            applyVoucher(voucherCodeInput.value);
        });
        
        voucherCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyVoucher(this.value);
            }
        });
    }
    
    // Xử lý khi có thay đổi giỏ hàng
    window.addEventListener('cart-updated', function() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        updateTotals();
    });
});