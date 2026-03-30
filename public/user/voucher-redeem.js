// voucher-redeem.js

class VoucherSystem {
  constructor() {
    // Dữ liệu mẫu: danh sách voucher có thể đổi
    this.vouchers = [
      { id: 1, name: "Voucher 10K", desc: "Giảm 10.000đ cho đơn hàng", points: 20, icon: "🎟️" },
      { id: 2, name: "Voucher 50K", desc: "Giảm 50.000đ", points: 50, icon: "🎁" },
      { id: 3, name: "Freeship", desc: "Miễn phí vận chuyển", points: 30, icon: "🚚" },
      { id: 4, name: "Voucher 100K", desc: "Giảm 100.000đ", points: 100, icon: "💎" }
    ];

    // Lấy người dùng từ localStorage (giả lập đăng nhập)
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
  }

  checkLogin() {
    return !!this.currentUser;
  }

  // Hàm đổi voucher
  redeemVoucher(voucherId) {
    const voucher = this.vouchers.find(v => v.id === voucherId);
    if (!voucher) {
      return { success: false, message: "Voucher không tồn tại!" };
    }

    if (this.currentUser.redeemedVouchers.some(v => v.id === voucherId)) {
      return { success: false, message: "Bạn đã đổi voucher này rồi!" };
    }

    if (this.currentUser.points < voucher.points) {
      return { success: false, message: "Không đủ điểm để đổi voucher này!" };
    }

    // Trừ điểm và lưu voucher đã đổi
    this.currentUser.points -= voucher.points;
    this.currentUser.redeemedVouchers.push({
      id: voucher.id,
      name: voucher.name,
      points: voucher.points,
      redeemedAt: new Date().toISOString()
    });

    // Lưu lại vào localStorage
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

    return {
      success: true,
      message: `Đổi thành công voucher: ${voucher.name}!`,
      remainingPoints: this.currentUser.points
    };
  }
}