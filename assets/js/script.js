// Load data from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// ===== 1. ADD TO CART =====
function addToCart(id, name, price) {
    let existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id, name, price, qty: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount(); // New: Updates navbar count
    alert(name + " added to cart 🛒");
    if(document.getElementById("cartItems")) { renderCart(); }
}

// ===== 2. DIRECT BUY =====
function directBuy(id, name, price) {
    cart = [{ id, name, price, qty: 1 }];
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    window.location.href = "pages/cart.html";
}

// ===== 3. RENDER CART (Updated with +/- Buttons) =====
function renderCart() {
    let cartDiv = document.getElementById("cartItems");
    if (!cartDiv) return;
    cartDiv.innerHTML = ""; 
    let total = 0;
    if (cart.length === 0) {
        cartDiv.innerHTML = `
            <div style="text-align:center; padding: 50px;">
                <p style="font-size: 20px; color: #64748b;">Your cart is empty.</p>
                <a href="../index.html" style="color: #2563eb; font-weight: bold;">Continue Shopping</a>
            </div>`;
    } else {
        cart.forEach((item, index) => {
            let itemTotal = item.price * item.qty;
            total += itemTotal;
            cartDiv.innerHTML += `
                <div class="cart-card" style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <b style="font-size: 16px;">${item.name}</b><br>
                            <span style="color: #64748b;">Price: ₹${item.price}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button onclick="updateQty(${index}, -1)" style="padding: 5px 10px; background: #e2e8f0; color: black; border:none; border-radius:4px;">-</button>
                            <b>${item.qty}</b>
                            <button onclick="updateQty(${index}, 1)" style="padding: 5px 10px; background: #e2e8f0; color: black; border:none; border-radius:4px;">+</button>
                            <button onclick="removeItem(${index})" style="background: #fee2e2; color: #ef4444; border:none; padding:5px 10px; border-radius:4px; margin-left: 10px;">🗑️</button>
                        </div>
                    </div>
                    <div style="text-align: right; margin-top: 10px; font-weight: bold; color: #2563eb;">
                        Total: ₹${itemTotal}
                    </div>
                </div>`;
        });
    }
    if (document.getElementById("totalAmountText")) {
        document.getElementById("totalAmountText").textContent = `Total Amount: ₹${total}`;
    }
    if(document.getElementById("finalTotalAmount")) {
        document.getElementById("finalTotalAmount").value = total;
    }
    updateCartCount();
}

// NEW: Helper for Quantity
function updateQty(index, change) {
    cart[index].qty += change;
    if (cart[index].qty < 1) return removeItem(index);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

// NEW: Helper for Removing Item
function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

// NEW: Update Navbar Cart Counter
function updateCartCount() {
    let count = cart.reduce((acc, item) => acc + item.qty, 0);
    let cartBtn = document.querySelector(".cart-link");
    if (cartBtn) {
        cartBtn.innerHTML = `Go to Cart 🛒 <span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-left: 5px;">${count}</span>`;
    }
}

// ===== 4. TOGGLE FAVORITE =====
function toggleFavorite(id, name, price, btnElement) {
    let favs = JSON.parse(localStorage.getItem("favorites")) || [];
    let index = favs.findIndex(item => item.id === id);

    if (index > -1) {
        favs.splice(index, 1);
        btnElement.classList.remove("active");
        alert(name + " removed from favorites 💔");
    } else {
        favs.push({ id, name, price });
        btnElement.classList.add("active");
        alert(name + " added to favorites ❤️");
    }
    localStorage.setItem("favorites", JSON.stringify(favs));
}

// ===== 5. BUY FUNCTION (FIXED) =====
async function buy() {
    let name = document.getElementById("custName")?.value;
    let phone = document.getElementById("custPhone")?.value;
    let address = document.getElementById("custAddress")?.value;

    if (!name || !phone || !address) {
        alert("Please fill in your Name, Phone, and Address for delivery! 🚚");
        return;
    }

    if (cart.length === 0) return alert("Cart empty!");
    
    let methods = document.getElementsByName("pay-method");
    let selectedPayment = "Cash on Delivery"; 
    for (let m of methods) { if (m.checked) { selectedPayment = m.value; break; } }

    let orderId = "ORD" + Math.floor(100000 + Math.random() * 900000);
    let now = new Date();
    let delivery = new Date();
    delivery.setDate(now.getDate() + 5);

    let finalCalculatedTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    const orderData = {
        orderId: orderId,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        items: [...cart],
        total: finalCalculatedTotal,
        paymentMethod: selectedPayment,
        orderDate: now.toLocaleString(),
        deliveryDate: delivery.toDateString(),
        status: "Pending"
    };

    let history = JSON.parse(localStorage.getItem("adminOrders")) || [];
    history.unshift(orderData);
    localStorage.setItem("adminOrders", JSON.stringify(history));

    localStorage.setItem("lastOrderItems", JSON.stringify(cart));
    localStorage.setItem("lastOrderDetails", JSON.stringify(orderData));

    if(document.getElementById("orderId")) {
        document.getElementById("orderId").innerText = orderId;
    }
    
    if(document.getElementById("successPopup")) {
        document.getElementById("successPopup").style.display = "flex";
        
        // CSS OVERRIDE FIX: 
        let viewBillBtn = document.getElementById("view-bill-btn");
        if(viewBillBtn) {
            viewBillBtn.style.setProperty("background-color", "#0bc83e", "important");
            viewBillBtn.style.setProperty("color", "white", "important");
            viewBillBtn.style.setProperty("opacity", "1", "important");
        }
    }
}

// ===== 6. ADMIN: CLEAR ALL =====
function clearAllOrders() {
    if (confirm("Are you sure?")) {
        localStorage.removeItem("adminOrders");
        location.reload(); 
    }
}

// ===== 7. LOAD PAGES =====
window.onload = function () {
    renderCart();
    updateCartCount(); 
    let favs = JSON.parse(localStorage.getItem("favorites")) || [];
    document.querySelectorAll(".fav-btn").forEach(btn => {
        if (favs.some(f => f.id === btn.getAttribute("data-id"))) {
            btn.classList.add("active");
        }
    });
};

function closePopup() {
    localStorage.removeItem("cart"); 
    cart = []; 
    window.location.href = "pages/receipt.html";
}

// ===== 8. UPDATED SEARCH =====
function searchProducts() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let products = document.getElementsByClassName('product');

    for (let i = 0; i < products.length; i++) {
        let titleElement = products[i].querySelector('h3');
        let brandElement = products[i].querySelector('.brand-name');
        
        let originalTitle = titleElement.getAttribute('data-original') || titleElement.innerText;
        let originalBrand = brandElement.getAttribute('data-original') || brandElement.innerText;

        if (!titleElement.hasAttribute('data-original')) titleElement.setAttribute('data-original', originalTitle);
        if (!brandElement.hasAttribute('data-original')) brandElement.setAttribute('data-original', originalBrand);

        if (input.trim() === "") {
            products[i].style.display = "";
            titleElement.innerHTML = originalTitle;
            brandElement.innerHTML = originalBrand;
            continue;
        }

        if (originalTitle.toLowerCase().includes(input) || originalBrand.toLowerCase().includes(input)) {
            products[i].style.display = ""; 
            let regex = new RegExp(`(${input})`, "gi");
            titleElement.innerHTML = originalTitle.replace(regex, "<mark style='background: yellow; color: black; padding: 0;'>$1</mark>");
            brandElement.innerHTML = originalBrand.replace(regex, "<mark style='background: yellow; color: black; padding: 0;'>$1</mark>");
        } else {
            products[i].style.display = "none";
        }
    }
}

// ===== 9. PROFILE DROPDOWN =====
function toggleDropdown() {
    const menu = document.getElementById("profileDropdown");
    if (menu) {
        menu.classList.toggle("active");
    }
}

window.addEventListener("click", function(event) {
    if (!event.target.closest('.profile-container')) {
        const dropdowns = document.getElementsByClassName("dropdown-menu");
        for (let i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].classList.contains('active')) {
                dropdowns[i].classList.remove('active');
            }
        }
    }
});

// ===== 10. AUTO-DELETE AFTER 15 DAYS =====
function autoCleanupOrders() {
    let history = JSON.parse(localStorage.getItem("adminOrders")) || [];
    if (history.length === 0) return;

    const fifteenDays = 15 * 24 * 60 * 60 * 1000; // 15 days in ms
    const now = new Date().getTime();

    let updatedHistory = history.filter(order => {
        let orderDate = new Date(order.orderDate).getTime();
        return (now - orderDate) < fifteenDays;
    });

    if (updatedHistory.length !== history.length) {
        localStorage.setItem("adminOrders", JSON.stringify(updatedHistory));
        if(typeof loadOrders === "function") loadOrders(); 
    }
}
window.addEventListener("load", autoCleanupOrders);

// ===== 11. ADMIN: ADD NEW PRODUCT TO WEBSITE =====
function addNewProduct() {
    let name = document.getElementById("pName").value;
    let brand = document.getElementById("pBrand").value;
    let price = document.getElementById("pPrice").value;
    let image = document.getElementById("pImage").value;

    if(!name || !brand || !price || !image) {
        alert("Please fill all product details!");
        return;
    }

    let products = JSON.parse(localStorage.getItem("storeProducts")) || [];
    
    let newProduct = {
        id: "P" + Date.now(),
        name: name,
        brand: brand,
        price: parseInt(price),
        image: image
    };

    products.push(newProduct);
    localStorage.setItem("storeProducts", JSON.stringify(products));
    alert("Product added successfully! It will now show on your Shop page.");
    
    document.getElementById("pName").value = "";
    document.getElementById("pBrand").value = "";
    document.getElementById("pPrice").value = "";
    document.getElementById("pImage").value = "";
}

// ===== 12. ADMIN: DELETE SINGLE ORDER =====
function deleteOrder(index) {
    let orders = JSON.parse(localStorage.getItem("adminOrders")) || [];
    if(confirm("Are you sure you want to delete this order?")) {
        orders.splice(index, 1);
        localStorage.setItem("adminOrders", JSON.stringify(orders));
        if(typeof loadOrders === "function") loadOrders();
    }
}