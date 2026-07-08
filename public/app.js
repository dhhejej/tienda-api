// State Management
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let orders = [];

// DOM Elements
const productList = document.getElementById('product-list');
const ordersList = document.getElementById('orders-list');
const cartBadge = document.getElementById('cart-badge');
const cartDrawer = document.getElementById('cart-drawer');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');
const drawerOverlay = document.getElementById('drawer-overlay');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const toast = document.getElementById('toast');

const navCatalogBtn = document.getElementById('nav-catalog-btn');
const navOrdersBtn = document.getElementById('nav-orders-btn');
const navAdminBtn = document.getElementById('nav-admin-btn');

const catalogView = document.getElementById('catalog-view');
const ordersView = document.getElementById('orders-view');
const adminView = document.getElementById('admin-view');

const addProductForm = document.getElementById('add-product-form');
const inventoryList = document.getElementById('inventory-list');


// Fetch Catalog
async function fetchCatalog() {
  try {
    const res = await fetch('/api/products');
    products = await res.json();
    renderCatalog();
    renderInventory();
    updateCartUI();
  } catch (err) {
    showToast('Error cargando los productos');
    console.error(err);
  }
}

// Fetch Orders
async function fetchOrders() {
  try {
    const res = await fetch('/api/orders');
    orders = await res.json();
    renderOrders();
  } catch (err) {
    showToast('Error cargando el historial de órdenes');
    console.error(err);
  }
}

// Render Products Catalog
function renderCatalog() {
  productList.innerHTML = '';
  products.forEach(p => {
    const inCartQty = getCartItemQty(p.id);
    const availableStock = p.stock - inCartQty;
    const isOutOfStock = availableStock <= 0;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-info">
        <h3>${escapeHtml(p.name)}</h3>
        <p class="product-desc">${escapeHtml(p.description)}</p>
        <div class="product-meta">
          <span class="product-price">$${p.price.toLocaleString('es-CL')}</span>
          <span class="stock-status ${p.stock > 0 ? 'stock-in' : 'stock-out'}">
            ${p.stock > 0 ? `Stock: ${p.stock}` : 'Agotado'}
          </span>
        </div>
      </div>
      <button class="add-to-cart-btn" ${isOutOfStock ? 'disabled' : ''} onclick="addToCart('${p.id}')">
        ${isOutOfStock ? 'Sin Stock' : 'Añadir al Carrito'}
      </button>
    `;
    productList.appendChild(card);
  });
}

// Helper to escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Get item quantity currently in cart
function getCartItemQty(productId) {
  const item = cart.find(item => item.productId === productId);
  return item ? item.quantity : 0;
}

// Add Item to Cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const cartItem = cart.find(item => item.productId === productId);
  const currentQty = cartItem ? cartItem.quantity : 0;

  if (currentQty >= product.stock) {
    showToast(`No hay suficiente stock de ${product.name}`);
    return;
  }

  if (cartItem) {
    cartItem.quantity++;
  } else {
    cart.push({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  renderCatalog();
  showToast(`Añadido: ${product.name}`);
}

// Remove/Decrease quantity in cart
function decreaseCartQty(productId) {
  const cartItem = cart.find(item => item.productId === productId);
  if (!cartItem) return;

  cartItem.quantity--;
  if (cartItem.quantity <= 0) {
    cart = cart.filter(item => item.productId !== productId);
  }

  saveCart();
  updateCartUI();
  renderCatalog();
}

// Increase quantity in cart
function increaseCartQty(productId) {
  const product = products.find(p => p.id === productId);
  const cartItem = cart.find(item => item.productId === productId);
  if (!product || !cartItem) return;

  if (cartItem.quantity >= product.stock) {
    showToast(`Límite de stock alcanzado para ${product.name}`);
    return;
  }

  cartItem.quantity++;
  saveCart();
  updateCartUI();
  renderCatalog();
}

// Save Cart to LocalStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Update Cart Badge and Drawer UI
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.innerText = totalItems;

  cartItemsContainer.innerHTML = '';
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart-message"><p>Tu carrito está vacío</p></div>';
    checkoutBtn.disabled = true;
    cartSubtotal.innerText = '$0.00';
    cartTotal.innerText = '$0.00';
    return;
  }

  checkoutBtn.disabled = false;
  let subtotal = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div class="cart-item-info">
        <h4>${escapeHtml(item.productName)}</h4>
        <p>$${item.price.toLocaleString('es-CL')} c/u • $${itemTotal.toLocaleString('es-CL')}</p>
      </div>
      <div class="cart-item-actions">
        <button class="qty-btn" onclick="decreaseCartQty('${item.productId}')">-</button>
        <span class="qty-val">${item.quantity}</span>
        <button class="qty-btn" onclick="increaseCartQty('${item.productId}')">+</button>
      </div>
    `;
    cartItemsContainer.appendChild(itemEl);
  });

  cartSubtotal.innerText = `$${subtotal.toLocaleString('es-CL')}`;
  cartTotal.innerText = `$${subtotal.toLocaleString('es-CL')}`;
}

// Render Orders History
function renderOrders() {
  ordersList.innerHTML = '';
  if (orders.length === 0) {
    ordersList.innerHTML = '<div class="no-orders-message"><p>No has realizado ninguna compra todavía.</p></div>';
    return;
  }

  orders.forEach(o => {
    const dateStr = new Date(o.createdAt).toLocaleString('es-CL', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const card = document.createElement('div');
    card.className = 'order-card';
    
    let itemsHtml = '';
    o.items.forEach(item => {
      itemsHtml += `
        <div class="order-item-row">
          <span><span class="order-item-qty">${item.quantity}x</span> ${escapeHtml(item.productName)}</span>
          <span>$${(item.price * item.quantity).toLocaleString('es-CL')}</span>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="order-header">
        <div>
          <span class="order-title">Orden #${o.id.substring(6)}</span>
          <div class="order-date">${dateStr}</div>
        </div>
        <span class="order-status-badge">${o.status}</span>
      </div>
      <div class="order-items-list">
        ${itemsHtml}
      </div>
      <div class="order-total-row">
        <span>Total Pagado</span>
        <span>$${o.total.toLocaleString('es-CL')}</span>
      </div>
    `;
    ordersList.appendChild(card);
  });
}

// Open/Close Cart Drawer
function toggleCartDrawer(open) {
  if (open) {
    cartDrawer.classList.add('open');
    drawerOverlay.classList.add('open');
  } else {
    cartDrawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
  }
}

// Confirm Purchase / Checkout
async function checkout() {
  if (cart.length === 0) return;

  checkoutBtn.disabled = true;
  checkoutBtn.innerText = 'Procesando...';

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error procesando la orden');
    }

    showToast('¡Compra realizada con éxito!');
    cart = [];
    saveCart();
    updateCartUI();
    toggleCartDrawer(false);
    
    // Refresh catalog to update stock values
    await fetchCatalog();
    
    // Switch to orders view to see checkout result
    switchView('orders');
  } catch (err) {
    showToast(err.message || 'Error al confirmar compra');
    console.error(err);
  } finally {
    checkoutBtn.innerText = 'Confirmar Compra';
    checkoutBtn.disabled = false;
  }
}

// Show Toast Alert
let toastTimeout;
function showToast(message) {
  clearTimeout(toastTimeout);
  toast.innerText = message;
  toast.classList.add('show');
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Switch SPA views
function switchView(viewName) {
  navCatalogBtn.classList.remove('active');
  navOrdersBtn.classList.remove('active');
  navAdminBtn.classList.remove('active');
  catalogView.classList.remove('active');
  ordersView.classList.remove('active');
  adminView.classList.remove('active');

  if (viewName === 'catalog') {
    navCatalogBtn.classList.add('active');
    catalogView.classList.add('active');
    fetchCatalog();
  } else if (viewName === 'orders') {
    navOrdersBtn.classList.add('active');
    ordersView.classList.add('active');
    fetchOrders();
  } else if (viewName === 'admin') {
    navAdminBtn.classList.add('active');
    adminView.classList.add('active');
    fetchCatalog();
  }
}

// Event Listeners
cartToggle.addEventListener('click', () => toggleCartDrawer(true));
closeCart.addEventListener('click', () => toggleCartDrawer(false));
drawerOverlay.addEventListener('click', () => toggleCartDrawer(false));
checkoutBtn.addEventListener('click', checkout);

navCatalogBtn.addEventListener('click', () => switchView('catalog'));
navOrdersBtn.addEventListener('click', () => switchView('orders'));
navAdminBtn.addEventListener('click', () => switchView('admin'));
addProductForm.addEventListener('submit', handleAddProductSubmit);

// Render Inventory in Admin Panel
function renderInventory() {
  inventoryList.innerHTML = '';
  if (products.length === 0) {
    inventoryList.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 2rem 0;">No hay productos registrados</td></tr>';
    return;
  }
  products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code>${escapeHtml(p.id)}</code></td>
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td>$${p.price.toLocaleString('es-CL')}</td>
      <td>${p.stock} uds</td>
      <td>
        <button class="delete-btn" onclick="deleteProduct('${p.id}')">Eliminar</button>
      </td>
    `;
    inventoryList.appendChild(tr);
  });
}

// Delete Product
async function deleteProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  if (!confirm(`¿Estás seguro de que deseas eliminar "${product.name}"?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al eliminar el producto');
    }

    showToast('Producto eliminado exitosamente');
    
    // Quitar del carrito si existía
    cart = cart.filter(item => item.productId !== productId);
    saveCart();

    await fetchCatalog();
  } catch (err) {
    showToast(err.message || 'Error al eliminar el producto');
    console.error(err);
  }
}

// Add Product Form Submit Handler
async function handleAddProductSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('prod-id').value.trim();
  const name = document.getElementById('prod-name').value.trim();
  const description = document.getElementById('prod-desc').value.trim();
  const price = Number(document.getElementById('prod-price').value);
  const stock = Number(document.getElementById('prod-stock').value);

  if (!id || !name || price <= 0 || stock < 0) {
    showToast('Por favor completa todos los campos correctamente');
    return;
  }

  if (products.some(p => p.id === id)) {
    showToast(`El ID "${id}" ya está en uso.`);
    return;
  }

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, name, description, price, stock })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al guardar el producto');
    }

    showToast('Producto creado con éxito');
    addProductForm.reset();
    
    await fetchCatalog();
  } catch (err) {
    showToast(err.message || 'Error al guardar el producto');
    console.error(err);
  }
}

// Global exposure for HTML click handlers
window.addToCart = addToCart;
window.decreaseCartQty = decreaseCartQty;
window.increaseCartQty = increaseCartQty;
window.deleteProduct = deleteProduct;

// Init
fetchCatalog();
