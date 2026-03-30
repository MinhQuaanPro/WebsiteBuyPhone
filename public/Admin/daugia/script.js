// /dau-gia/script.js

// =========== HÀM CHUNG ===========
function saveAuction(data) {
  localStorage.setItem('currentAuction', JSON.stringify(data));
}

function getAuction() {
  return JSON.parse(localStorage.getItem('currentAuction')) || null;
}

function saveHistory(auction) {
  let history = JSON.parse(localStorage.getItem('auctionHistory')) || [];
  history.push(auction);
  localStorage.setItem('auctionHistory', JSON.stringify(history));
}

// =========== TRANG NGƯỜI DÙNG (index.html) ===========
if (document.getElementById('bid-btn')) {
  const auction = getAuction();
  if (!auction) {
    document.body.innerHTML = '<h2>Chưa có phiên đấu giá nào!</h2>';
  } else {
    document.getElementById('current-bid').textContent = auction.currentBid.toLocaleString() + ' ₫';
    document.getElementById('bidder-name').textContent = auction.highestBidder || 'Chưa có';
    
    // Đếm ngược
    const endTime = new Date(auction.endTime);
    const countdownEl = document.getElementById('countdown');
    const bidBtn = document.getElementById('bid-btn');
    const messageEl = document.getElementById('message');

    function updateCountdown() {
      const now = new Date();
      const diff = endTime - now;

      if (diff <= 0) {
        clearInterval(timer);
        countdownEl.textContent = 'Đã kết thúc';
        bidBtn.disabled = true;

        // Hiển thị kết quả
        if (auction.highestBidder) {
          messageEl.className = 'message success';
          messageEl.textContent = `🎉 Chúc mừng ${auction.highestBidder} đã thắng với giá ${auction.currentBid.toLocaleString()} ₫!`;
          messageEl.classList.remove('hidden');
        } else {
          messageEl.className = 'message error';
          messageEl.textContent = 'Không có ai tham gia đấu giá.';
          messageEl.classList.remove('hidden');
        }
        return;
      }

      const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
      const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
      countdownEl.textContent = `${h}:${m}:${s}`;
    }

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();

    // Đặt giá
    bidBtn.addEventListener('click', () => {
      const now = new Date();
      if (now >= endTime) {
        alert('Phiên đấu giá đã kết thúc!');
        return;
      }

      const username = document.getElementById('username').value.trim();
      const amount = parseFloat(document.getElementById('bid-amount').value);

      if (!username) {
        showMessage('Vui lòng nhập tên!', 'error');
        return;
      }
      if (!amount || amount <= auction.currentBid) {
        showMessage('Giá phải lớn hơn giá hiện tại!', 'error');
        return;
      }

      // Cập nhật đấu giá
      auction.currentBid = amount;
      auction.highestBidder = username;
      saveAuction(auction);

      // Cập nhật UI
      document.getElementById('current-bid').textContent = amount.toLocaleString() + ' ₫';
      document.getElementById('bidder-name').textContent = username;
      showMessage('Đặt giá thành công!', 'success');
    });

    function showMessage(text, type) {
      messageEl.textContent = text;
      messageEl.className = `message ${type}`;
      messageEl.classList.remove('hidden');
      setTimeout(() => messageEl.classList.add('hidden'), 3000);
    }
  }
}

// =========== TRANG ADMIN (admin.html) ===========
if (document.getElementById('current-auction')) {
  // Hiển thị phiên hiện tại
  function renderCurrentAuction() {
    const auction = getAuction();
    const el = document.getElementById('current-auction');
    if (auction) {
      const endTime = new Date(auction.endTime);
      el.innerHTML = `
        <p><strong>${auction.productName}</strong></p>
        <p>Giá khởi điểm: ${auction.startPrice.toLocaleString()} ₫</p>
        <p>Giá hiện tại: ${auction.currentBid.toLocaleString()} ₫</p>
        <p>Người dẫn đầu: ${auction.highestBidder || 'Chưa có'}</p>
        <p>Kết thúc lúc: ${endTime.toLocaleString()}</p>
        <button onclick="endAuctionNow()">Kết thúc sớm</button>
        <button onclick="deleteAuction()">Xóa</button>
      `;
    } else {
      el.innerHTML = '<p>Chưa có phiên đấu giá nào.</p>';
    }
  }

  // Hiển thị lịch sử
  function renderHistory() {
    const history = JSON.parse(localStorage.getItem('auctionHistory')) || [];
    const el = document.getElementById('history-list');
    if (history.length === 0) {
      el.innerHTML = '<p>Chưa có lịch sử.</p>';
      return;
    }
    let html = '<ul>';
    history.forEach(a => {
      html += `<li>
        ${a.productName} - Giá thắng: ${a.currentBid.toLocaleString()} ₫ 
        (Người thắng: ${a.highestBidder || 'Không có'})
      </li>`;
    });
    html += '</ul>';
    el.innerHTML = html;
  }

  // Tạo phiên mới
  window.createAuction = function() {
    const name = document.getElementById('product-name').value.trim();
    const startPrice = parseFloat(document.getElementById('start-price').value);
    const duration = parseInt(document.getElementById('duration-min').value) || 5;

    if (!name || !startPrice) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + duration * 60 * 1000);

    const newAuction = {
      productName: name,
      startPrice: startPrice,
      currentBid: startPrice,
      highestBidder: null,
      endTime: endTime.toISOString()
    };

    saveAuction(newAuction);
    alert('Tạo phiên đấu giá thành công!');
    renderCurrentAuction();
  };

  // Xóa phiên
  window.deleteAuction = function() {
    if (confirm('Xóa phiên đấu giá hiện tại?')) {
      localStorage.removeItem('currentAuction');
      renderCurrentAuction();
    }
  };

  // Kết thúc sớm
  window.endAuctionNow = function() {
    const auction = getAuction();
    if (auction) {
      saveHistory(auction);
      localStorage.removeItem('currentAuction');
      alert('Đã lưu kết quả và kết thúc phiên!');
      renderCurrentAuction();
      renderHistory();
    }
  };

  // Khởi tạo
  renderCurrentAuction();
  renderHistory();
}