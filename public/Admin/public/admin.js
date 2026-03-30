const API = "http://localhost:3000/api/products";

const token = localStorage.getItem("token");
if (!token) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "index.html";
}

// Lấy danh sách
// async function load() {
//     const res = await fetch(API);
//     const data = await res.json();

//     // document.getElementById("list").innerHTML = data.map(p => `
//     //     <div style="border:1px solid #ddd; padding:10px; margin:5px">
//     //         <b>${p.name}</b> - ${p.price}₫
//     //         <br>
//     //         <img src="${p.image}" width="80">
//     //         <br>
//     //         <button onclick="del('${p._id}')">Xoá</button>
//     //     </div>
//     // `).join("");
//     document.getElementById("list").innerHTML = data.map(p => `
//     <div style="border:1px solid #ddd; padding:10px; margin:5px; display:inline-block; width:200px">
//         <b>${p.name || '⚠️ Không tên'}</b> - ${(p.price || 0).toLocaleString()}₫
//         <br>
//         <img src="${p.image || 'https://via.placeholder.com/80'}" 
//              width="80" 
//              onerror="this.src='https://via.placeholder.com/80?text=No+Image'">
//         <br>
//         <button onclick="del('${p._id}')">Xoá</button>
//     </div>
// `).join("");
// }
// load();

// Thêm
// async function addProduct() {
//     const body = {
//         name: name.value,
//         price: price.value,
//         image: image.value
//     };

//     await fetch(API, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             token
//         },
//         body: JSON.stringify(body)
//     });

//     load();
// }


// Load sản phẩm
async function load() {
    const res = await fetch(API);
    const data = await res.json();

    document.getElementById("list").innerHTML = data
        .map(p => `
            <div style="border:1px solid #ddd; padding:10px; margin:5px">
                <b>${p.name}</b> - ${p.price}đ
                <br>
                <img src="${p.image}" width="80"
                     onerror="this.src='https://placehold.co/80x80?text=No+Image'">
                <br>
                <button onclick="del('${p._id}')">Xoá</button>
            </div>
        `)
        .join("");
}


async function addProduct() {
    const nameInput = document.getElementById("name");
    const priceInput = document.getElementById("price");
    const imageInput = document.getElementById("image");

    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);
    const image = imageInput.value.trim();

    // Validate
    if (!name) {
        alert("Vui lòng nhập tên sản phẩm!");
        nameInput.focus();
        return;
    }
    if (isNaN(price) || price <= 0) {
        alert("Giá phải là số dương!");
        priceInput.focus();
        return;
    }

    const body = { name, price, image };

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                token
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json();
            alert("Lỗi: " + JSON.stringify(err));
            return;
        }

        // Reset form
        nameInput.value = "";
        priceInput.value = "";
        imageInput.value = "";

        load(); // reload danh sách
    } catch (error) {
        console.error("Lỗi mạng:", error);
        alert("Không thể kết nối server!");
    }
}

// Xoá
async function del(id) {
    await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { token }
    });
    load();
}
