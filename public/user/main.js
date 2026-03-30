let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// DOM
const regUsername = document.getElementById("reg-username");
const regPassword = document.getElementById("reg-password");
const registerBtn = document.getElementById("register-btn");
const regMsg = document.getElementById("reg-msg");

const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");
const loginMsg = document.getElementById("login-msg");

const welcomeBox = document.getElementById("welcome-box");
const userNameDisplay = document.getElementById("user-name");
const userPointsDisplay = document.getElementById("user-points");

const logoutBtn = document.getElementById("logout-btn");
const tasksBtn = document.getElementById("tasks-btn");

// Đăng ký
registerBtn.addEventListener("click", () => {
  const username = regUsername.value.trim();
  const password = regPassword.value.trim();
  if(!username || !password) { regMsg.textContent="Nhập đầy đủ!"; return; }
  if(users.find(u => u.username===username)) { regMsg.textContent="Tài khoản tồn tại!"; return; }
  const newUser = { username, password, points: 50, tasks: [] };
  users.push(newUser);
  saveUsers();
  loginUser(newUser);
  regMsg.textContent="Đăng ký thành công +50 điểm 🎉";
});

// Đăng nhập
loginBtn.addEventListener("click", () => {
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();
  const user = users.find(u => u.username===username && u.password===password);
  if(!user){ loginMsg.textContent="Sai tài khoản/mật khẩu!"; return; }
  loginUser(user);
});

// Logout
logoutBtn.addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("currentUser");
  welcomeBox.style.display="none";
});

// Đi tới nhiệm vụ
tasksBtn.addEventListener("click", () => {
  window.location.href="tasks.html";
});

// Hiển thị welcome
function loginUser(user){
  currentUser = user;

  // --- TÍNH ĐIỂM ĐĂNG NHẬP LẦN ĐẦU ---
  if(!currentUser.doneTasks) currentUser.doneTasks = [];
  if(!currentUser.doneTasks.includes(2)){   // 2 = task "Đăng nhập lần đầu"
    currentUser.points += 10;               // cộng 10 điểm
    currentUser.doneTasks.push(2);
    alert("Hoàn thành nhiệm vụ: Đăng nhập lần đầu +10 điểm!");
  }

  // Lưu dữ liệu
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let index = users.findIndex(u=>u.username===currentUser.username);
  if(index >=0){ users[index] = currentUser; localStorage.setItem("users", JSON.stringify(users)); }

  // Hiển thị giao diện
  welcome.style.display = "block";
  userNameDisplay.textContent = user.username;
  userPointsDisplay.textContent = user.points;
  userPopup.style.display = "none";
  renderTasks();
  updatePoints();
}


// Lưu dữ liệu
function saveUsers(){ localStorage.setItem("users", JSON.stringify(users)); }
function saveCurrentUser(){ saveUsers(); localStorage.setItem("currentUser", JSON.stringify(currentUser)); }

// Load
if(currentUser) loginUser(currentUser);

// main.js - Thêm vào cuối file
document.addEventListener('DOMContentLoaded', function() {
    // Cập nhật giỏ hàng khi có thay đổi
    function updateCart() {
        // Gọi lại các hàm cập nhật giỏ hàng
        const event = new Event('cart-updated');
        window.dispatchEvent(event);
    }

    // Đăng ký sự kiện khi giỏ hàng thay đổi
    if (typeof updateCart === 'function') {
        // Xử lý khi thêm sản phẩm
        document.querySelectorAll('.btn-cart').forEach(btn => {
            btn.addEventListener('click', updateCart);
        });

        // Xử lý khi xóa sản phẩm
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', updateCart);
        });

        // Xử lý khi thay đổi số lượng
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', updateCart);
        });
    }
});