let customers = JSON.parse(localStorage.getItem("customers")) || [];

// Danh sách 8 tài khoản mặc định
const defaultCustomers = [
  { name: "Nguyễn Văn Anh", phone: "0912345678", email: "a@example.com" },
  { name: "Trần Thị Bông", phone: "0987654321", email: "b@example.com" },
  { name: "Lê Văn C", phone: "0909123456", email: "c@example.com" },
  { name: " ", phone: "0934567890", email: "d@example.com" },
  { name: "Đỗ Văn E", phone: "0978123456", email: "e@example.com" },
  { name: "Hoàng Thị F", phone: "0967123456", email: "f@example.com" },
  { name: "Võ Văn G", phone: "0955123456", email: "g@example.com" },
  { name: "Bùi Thị H", phone: "0944123456", email: "h@example.com" }
];

// Thêm mặc định nếu chưa có dữ liệu
if (customers.length === 0) {
  customers = [...defaultCustomers];
  localStorage.setItem("customers", JSON.stringify(customers));
}

function renderCustomers() {
  const list = document.getElementById("customerList");
  list.innerHTML = "";

  customers.forEach((cust, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${cust.name}</td>
      <td>${cust.phone}</td>
      <td>${cust.email}</td>
      <td><button class="delete-btn" onclick="deleteCustomer(${index})">Xoá</button></td>
    `;
    list.appendChild(row);
  });
}

function addCustomer() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !phone || !email) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  customers.push({ name, phone, email });
  localStorage.setItem("customers", JSON.stringify(customers));
  renderCustomers();

  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("email").value = "";
}

function deleteCustomer(index) {
  if (confirm("Bạn có chắc muốn xoá khách hàng này?")) {
    customers.splice(index, 1);
    localStorage.setItem("customers", JSON.stringify(customers));
    renderCustomers();
  }
}

// Tải danh sách khi load trang
renderCustomers();
