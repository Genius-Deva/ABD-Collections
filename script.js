/*******************************
 * GLOBAL CONFIG
 *******************************/
const PAYSTACK_KEY = "pk_test_c45866c5be1986f3f209266085279469fdba5616";
const FLASH_DURATION = 6 * 60 * 60 * 1000; // 6 hours

/*******************************
 * FLASH SALE TIMER
 *******************************/
let flashEnd = new Date().getTime() + FLASH_DURATION;

setInterval(() => {
  let now = new Date().getTime();
  let diff = flashEnd - now;

  if (diff <= 0) {
    document.getElementById("timer").innerText = "Sale Ended";
    return;
  }

  let h = Math.floor(diff / 3600000);
  let m = Math.floor((diff % 3600000) / 60000);
  let s = Math.floor((diff % 60000) / 1000);

  document.getElementById("timer").innerText = `${h}h ${m}m ${s}s`;
}, 1000);

/*******************************
 * CART SYSTEM
 *******************************/
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(name, price, image) {
  let item = cart.find(p => p.name === name);
  if (item) {
    item.qty++;
  } else {
    cart.push({ name, price, image, qty: 1 });
  }
  saveCart();
}

function removeItem(name) {
  cart = cart.filter(p => p.name !== name);
  saveCart();
}

function renderCart() {
  let items = document.getElementById("cartItems");
  let total = 0;

  if (!items) return;

  items.innerHTML = "";

  cart.forEach(p => {
    total += p.price * p.qty;
    items.innerHTML += `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}">
        <div>
          <p>${p.name}</p>
          <small>₦${p.price} × ${p.qty}</small>
        </div>
        <button onclick="removeItem('${p.name}')">×</button>
      </div>
    `;
  });

  document.getElementById("cartTotal").innerText = total;
  document.getElementById("cartCount").innerText = cart.length;
}

function toggleCart() {
  document.getElementById("cart").classList.toggle("active");
}

/*******************************
 * PAYSTACK CHECKOUT
 *******************************/

  function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty");
    return;
  }

  let total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  let email =
    document.getElementById("customerEmail")?.value || "guest@email.com";

  let orderRef = "ORD_" + Date.now();

  let handler = PaystackPop.setup({
    key: PAYSTACK_KEY,
    email: email,
    amount: total * 100,
    currency: "NGN",
    ref: orderRef,
    callback: function (response) {

      // SAVE ORDER
      saveOrder({
        ref: response.reference,
        email: email,
        items: cart,
        total: total,
        date: new Date().toLocaleString(),
        status: "Paid"
      });

      alert("Payment successful!");
      cart = [];
      saveCart();
      toggleCart();
    },
    onClose: function () {
      alert("Payment cancelled");
    }
  });

  handler.openIframe();
}

  let total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  let email =
    document.getElementById("customerEmail")?.value || "guest@email.com";

  let handler = PaystackPop.setup({
    key: PAYSTACK_KEY,
    email: email,
    amount: total * 100,
    currency: "NGN",
    ref: "ORDER_" + Date.now(),
    callback: function (response) {
      alert("Payment successful!\nReference: " + response.reference);
      cart = [];
      saveCart();
      toggleCart();
    },
    onClose: function () {
      alert("Payment cancelled");
    }
  });

  handler.openIframe();
}

/*******************************
 * PRODUCT STORAGE (ADMIN)
 *******************************/
let products = JSON.parse(localStorage.getItem("products")) || [];

function addProduct() {
  let name = pName.value;
  let price = Number(pPrice.value);
  let image = pImage.value;
  let category = pCategory.value;

  if (!name || !price || !image || !category) {
    alert("Fill all fields");
    return;
  }

  products.push({ name, price, image, category });
  localStorage.setItem("products", JSON.stringify(products));

  pName.value = pPrice.value = pImage.value = "";
  renderAdmin();
  renderProducts();
}

function deleteProduct(index) {
  products.splice(index, 1);
  localStorage.setItem("products", JSON.stringify(products));
  renderAdmin();
  renderProducts();
}

function renderAdmin() {
  let box = document.getElementById("adminProducts");
  if (!box) return;

  box.innerHTML = "";
  products.forEach((p, i) => {
    box.innerHTML += `
      <div class="admin-product">
        <span>${p.name} – ₦${p.price}</span>
        <button onclick="deleteProduct(${i})">X</button>
      </div>
    `;
  });
}

/*******************************
 * PRODUCT DISPLAY
 *******************************/
function renderProducts() {
  let flash = document.getElementById("flash");
  let electronics = document.getElementById("electronics");
  let fashion = document.getElementById("fashion");

  if (!flash || !electronics || !fashion) return;

  flash.innerHTML = electronics.innerHTML = fashion.innerHTML = "";

  products.forEach(p => {
    let card = `
      <div class="card">
        <img src="${p.image}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p class="price">₦${p.price}</p>
        <button onclick="addToCart('${p.name}', ${p.price}, '${p.image}')">
          Add to Cart
        </button>
      </div>
    `;

    if (p.category === "flash") flash.innerHTML += card;
    if (p.category === "electronics") electronics.innerHTML += card;
    if (p.category === "fashion") fashion.innerHTML += card;
  });
}

/*******************************
 * CAROUSEL AUTO-SCROLL
 *******************************/
document.querySelectorAll(".carousel").forEach(carousel => {
  setInterval(() => {
    carousel.scrollLeft += 160;
    if (
      carousel.scrollLeft + carousel.clientWidth >=
      carousel.scrollWidth
    ) {
      carousel.scrollLeft = 0;
    }
  }, 4000);
});

/*******************************
 * ADMIN PAGE PROTECTION
 *******************************/
if (location.pathname.includes("admin")) {
  let pass = prompt("Enter Admin Password:");
  if (pass !== "admin123") {
    alert("Access denied");
    location.href = "index.html";
  }
}

/*******************************
 * INITIAL LOAD
 *******************************/
renderCart();
renderAdmin();
renderProducts();
/*******************************
 * ORDER HISTORY
 *******************************/
let orders = JSON.parse(localStorage.getItem("orders")) || [];

function saveOrder(order){
  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));
}