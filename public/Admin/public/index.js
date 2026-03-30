async function loadProducts() {
    const res = await fetch("http://localhost:3000/api/products");
    const products = await res.json();

    const box = document.getElementById("products");
    box.innerHTML = "";

    products.forEach(p => {
    box.innerHTML += `
        <div style="width: 200px; border:1px solid #ccc; padding:10px; border-radius:10px;">
            <img src="${p.image}" width="100%" 
                 onerror="this.src='https://placehold.co/200x200?text=No+Image'">
            <h3>${p.name}</h3>
            <p style="color:red">${p.price.toLocaleString()} đ</p>
        </div>
    `;
});

}

loadProducts();
