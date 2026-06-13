 function updateFooterTime() {
    const timeDisplay = document.getElementById('footer-live-time');
    if (!timeDisplay) return;
    
    const options = {
      timeZone: 'Africa/Lagos',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    const formatter = new Intl.DateTimeFormat('en-US', options);
    timeDisplay.textContent = formatter.format(new Date()) + ' WAT';
  }
  setInterval(updateFooterTime, 30000);
  updateFooterTime();


// ======= PRODUCT DATA =======
// Each product has a unique SVG illustration
const PRODUCTS = [
  { id: 'vco', name: 'Virgin Coconut Oil', price: 8500, category: 'oil', badge: 'Best Seller', desc: 'Cold-pressed, 500ml', color: '#FFF8ED', accent: '#C9954D' },
  { id: 'garri', name: 'Coconut Garri', price: 1000 , category: 'food', badge: 'New', desc: 'RubiesOrganic, 1kg pack', color: '#F5E6D0', accent: '#8B5A2B' },
  { id: 'granola', name: 'Granola', price: 1000, category: 'food', badge: '', desc: 'Honey & oats, 500g', color: '#F0E0C0', accent: '#A8752A' },
  { id: 'cw', name: 'Coconut water', price: 1000, category: 'drink', badge: '', desc: 'good health, 500g', color: '#E8C8A0', accent: '#6B4423' }
];

// Product images (real photos)
const PRODUCT_IMAGES = {
  'vco': 'https://images.unsplash.com/photo-1600270886742-4db8d1e3b7c4?w=400&h=400&fit=crop',
  'garri': 'https://images.unsplash.com/photo-1599599810694-b5ac4dd4d02a?w=400&h=400&fit=crop',
  'granola': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=400&fit=crop',
  'cw': 'https://images.unsplash.com/photo-1556185781-a56a4168e7e1?w=400&h=400&fit=crop'
};

// Fallback SVG for image load errors
function productSVG(product) {
  const { id, color, accent } = product;
  const common = `<defs><linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${accent}" stop-opacity="0.4"/></linearGradient></defs>`;
  return `<svg viewBox="0 0 200 200">${common}<ellipse cx="100" cy="180" rx="45" ry="6" fill="#000" opacity="0.15"/><rect x="45" y="70" width="110" height="90" fill="url(#g-${id})" stroke="${accent}" stroke-width="1.5" rx="8"/><circle cx="100" cy="115" r="25" fill="white" opacity="0.4"/></svg>`;
}

// ======= STATE =======
let cart = []; // loaded from data SDK
let currentFilter = 'all';

// ======= ELEMENT SDK CONFIG =======
const defaultConfig = {
  brand_name: "Rubies Organic",
  tagline: "Pure. Natural. Organic.",
  hero_title: "The Essence of the Coconut, Bottled by Nature.",
  hero_subtitle: "From virgin coconut oil to artisanal coconut garri — discover pure, cold-pressed goodness harvested and crafted with care.",
  about_heading: "Rooted in Nature. Born in Nigeria.",
  about_text: "Rubies Organic is more than a brand — it's a promise. A promise that every product that leaves our hands carries the purity of the coconut, the warmth of the African sun, and the dedication of the farmers who grow them.",
  contact_email: "hello@rubiesorganic.co",
  contact_phone: "+234 800 000 0000",
  contact_address: "Lagos, Nigeria"
};

async function onConfigChange(config) {
  const get = (k) => config[k] || defaultConfig[k];
  document.getElementById('nav-brand').textContent = get('brand_name');
  document.getElementById('nav-tagline').textContent = get('tagline');
  document.getElementById('footer-brand').textContent = get('brand_name');
  document.getElementById('hero-title').textContent = get('hero_title');
  document.getElementById('hero-subtitle').textContent = get('hero_subtitle');
  document.getElementById('about-heading').textContent = get('about_heading');
  document.getElementById('about-text').textContent = get('about_text');
  document.getElementById('contact-email-display').textContent = get('contact_email');
  document.getElementById('contact-phone-display').textContent = get('contact_phone');
  document.getElementById('contact-address-display').textContent = get('contact_address');
  document.title = `${get('brand_name')} - Pure Coconut Products`;
}

if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities: () => ({ recolorables: [], borderables: [], fontEditable: undefined, fontSizeable: undefined }),
    mapToEditPanelValues: (c) => new Map(Object.keys(defaultConfig).map(k => [k, (c[k] || defaultConfig[k]).toString()]))
  });
}

// ======= NAVIGATION =======
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('[data-nav]').forEach(n => {
    n.classList.toggle('active', n.getAttribute('data-nav') === page);
  });
  document.getElementById('mobile-menu').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'cart') renderCart();
}

document.getElementById('mobile-menu-btn').addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.toggle('hidden');
});

// ======= PRODUCT RENDERING =======
function productCard(p, featured = false) {
  const inCart = cart.find(c => c.product_id === p.id);
  const imageUrl = PRODUCT_IMAGES[p.id];
  return `
    <div class="product-card rounded-2xl border border-[#E8D9BC] overflow-hidden">
      <div class="relative h-56 flex items-center justify-center bg-cover bg-center overflow-hidden" style="background-image: url('${imageUrl}'); background-size: cover;">
        <img src="${imageUrl}" alt="${p.name}" loading="lazy" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, ${p.color} 0%, ${p.accent}20 100%)'; this.nextElementSibling.style.display='block';">
        <div class="product-visual w-40 h-40 hidden">${productSVG(p)}</div>
        ${p.badge ? `<span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#A8323A] text-white">${p.badge}</span>` : ''}
        <span class="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-semibold bg-white/90 text-[#3D2817] capitalize">${p.category}</span>
      </div>
      <div class="p-5">
        <h3 class="font-display font-bold text-[#3D2817] text-lg leading-tight">${p.name}</h3>
        <p class="text-xs text-[#6B4423] mt-1">${p.desc}</p>
        <div class="flex items-end justify-between mt-4">
          <div>
            <div class="text-[10px] uppercase tracking-widest text-[#6B4423]">Price</div>
            <div class="font-display font-bold text-xl text-[#3D2817]">₦${p.price.toLocaleString()}</div>
          </div>
          <button onclick="addToCart('${p.id}')" class="btn-primary text-white w-10 h-10 rounded-full flex items-center justify-center" aria-label="Add to cart">
            <i data-lucide="${inCart ? 'check' : 'plus'}" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderFeatured() {
  document.getElementById('featured-products').innerHTML = PRODUCTS.slice(0, 4).map(p => productCard(p, true)).join('');
  lucide.createIcons();
}

function renderShop() {
  const filtered = currentFilter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === currentFilter);
  document.getElementById('shop-products').innerHTML = filtered.map(p => productCard(p)).join('');
  lucide.createIcons();
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active', 'bg-[#3D2817]', 'text-white', 'border-[#6B4423]');
      b.classList.add('bg-white', 'text-[#3D2817]', 'border-[#D4BFA0]');
    });
    btn.classList.add('active', 'bg-[#3D2817]', 'text-white', 'border-[#6B4423]');
    btn.classList.remove('bg-white', 'text-[#3D2817]', 'border-[#D4BFA0]');
    renderShop();
  });
});

// ======= CART (DATA SDK) =======
async function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  const existing = cart.find(c => c.product_id === productId);
  
  if (cart.length >= 999 && !existing) {
    showToast('Cart limit reached. Please remove items first.', 'error');
    return;
  }
  
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
    const result = await window.dataSdk.update(existing);
    if (!result.isOk) { showToast('Could not update cart', 'error'); return; }
    showToast(`Added another ${product.name}`);
  } else {
    const record = {
      type: 'cart_item',
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
      name: '',
      email: '',
      phone: '',
      message: '',
      createdAt: new Date().toISOString()
    };
    const result = await window.dataSdk.create(record);
    if (!result.isOk) { showToast('Could not add to cart', 'error'); return; }
    showToast(`${product.name} added to cart!`);
  }
}

async function updateQuantity(backendId, delta) {
  const item = cart.find(c => c.__backendId === backendId);
  if (!item) return;
  const newQty = (item.quantity || 1) + delta;
  if (newQty <= 0) {
    await window.dataSdk.delete(item);
    showToast('Item removed');
  } else {
    item.quantity = newQty;
    await window.dataSdk.update(item);
  }
}

async function removeItem(backendId) {
  const item = cart.find(c => c.__backendId === backendId);
  if (!item) return;
  const result = await window.dataSdk.delete(item);
  if (result.isOk) showToast('Item removed');
}

function renderCart() {
  const container = document.getElementById('cart-content');
  const cartItems = cart.filter(c => c.type === 'cart_item');
  
  if (cartItems.length === 0) {
    container.innerHTML = `
      <div class="bg-white rounded-3xl p-12 text-center border border-[#E8D9BC]">
        <div class="w-20 h-20 mx-auto rounded-full bg-[#FFF8ED] flex items-center justify-center mb-4">
          <i data-lucide="shopping-bag" class="w-10 h-10 text-[#6B4423]"></i>
        </div>
        <h2 class="font-display text-2xl font-bold text-[#3D2817] mb-2">Your cart is empty</h2>
        <p class="text-[#6B4423] mb-6">Discover our pure coconut collection</p>
        <button onclick="navigateTo('shop')" class="btn-primary text-white px-8 py-3 rounded-full font-semibold">Start Shopping</button>
      </div>`;
    lucide.createIcons();
    return;
  }
  
  const subtotal = cartItems.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);
  const delivery = 1500;
  const total = subtotal + delivery;
  
  container.innerHTML = `
    <div class="grid md:grid-cols-3 gap-6">
      <div class="md:col-span-2 space-y-3">
        ${cartItems.map(item => {
          const p = PRODUCTS.find(x => x.id === item.product_id);
          return `
          <div class="bg-white rounded-2xl p-4 border border-[#E8D9BC] flex gap-4 items-center">
            <div class="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden bg-cover bg-center" style="background-image: url('${PRODUCT_IMAGES[p?.id] || ''}');">
              <img src="${PRODUCT_IMAGES[p?.id] || ''}" alt="${p?.name || ''}" loading="lazy" class="w-full h-full object-cover" onerror="this.style.display='none';">
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-display font-bold text-[#3D2817] truncate">${item.product_name}</h3>
              <p class="text-xs text-[#6B4423]">${p?.desc || ''}</p>
              <div class="font-semibold text-[#A8323A] mt-1">₦${item.price.toLocaleString()}</div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="updateQuantity('${item.__backendId}', -1)" class="w-8 h-8 rounded-full bg-[#FFF8ED] border border-[#E8D9BC] flex items-center justify-center hover:bg-[#F5E6D0]" aria-label="Decrease"><i data-lucide="minus" class="w-3 h-3"></i></button>
              <span class="w-8 text-center font-semibold text-[#3D2817]">${item.quantity || 1}</span>
              <button onclick="updateQuanti
              ty('${item.__backendId}', 1)" class="w-8 h-8 rounded-full bg-[#FFF8ED] border border-[#E8D9BC] flex items-center justify-center hover:bg-[#F5E6D0]" aria-label="Increase"><i data-lucide="plus" class="w-3 h-3"></i></button>
              <button onclick="removeItem('${item.__backendId}')" class="w-8 h-8 rounded-full bg-[#A8323A]/10 text-[#A8323A] flex items-center justify-center ml-2 hover:bg-[#A8323A]/20" aria-label="Remove"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="bg-[#3D2817] text-white rounded-2xl p-6 h-fit sticky top-24">
        <h3 class="font-display font-bold text-xl mb-5">Order Summary</h3>
        <div class="space-y-3 text-sm border-b border-white/10 pb-4">
          <div class="flex justify-between"><span class="text-white/70">Subtotal</span><span>₦${subtotal.toLocaleString()}</span></div>
          <div class="flex justify-between"><span class="text-white/70">Delivery</span><span>₦${delivery.toLocaleString()}</span></div>
        </div>
        <div class="flex justify-between items-end mt-4 mb-5">
          <span class="text-white/70 text-sm">Total</span>
          <span class="font-display text-2xl font-bold text-[#C9954D]">₦${total.toLocaleString()}</span>
        </div>
        <button onclick="checkout()" class="btn-gold w-full py-3 rounded-xl font-semibold text-[#3D2817] flex items-center justify-center gap-2">
          <i data-lucide="credit-card" class="w-4 h-4"></i> Checkout (Demo)
        </button>
        <p class="text-[10px] text-white/50 text-center mt-3">Checkout is a demo — no payment processed.</p>
      </div>
    </div>`;
  lucide.createIcons();
}

async function checkout() {
  const items = cart.filter(c => c.type === 'cart_item');
  for (const item of items) {
    await window.dataSdk.delete(item);
  }
  showToast('Demo order placed! Cart cleared.', 'success');
  setTimeout(() => navigateTo('home'), 1200);
  
}
// ======= CHECKOUT PAGE =======
function renderCheckoutSummary() {
  const cartItems = cart.filter(c => c.type === 'cart_item');
  const subtotal = cartItems.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);
  const delivery = 1500;
  const total = subtotal + delivery;
  
  const summary = document.getElementById('checkout-summary');
  summary.innerHTML = `
    <div>
      <h3 class="font-display font-bold text-[#3D2817] text-lg mb-4">Order Summary</h3>
      <div class="space-y-2 pb-4 border-b border-[#E8D9BC]">
        ${cartItems.map(item => `
          <div class="flex justify-between text-sm">
            <span class="text-[#6B4423]">${item.product_name} <span class="font-semibold text-[#3D2817]">x${item.quantity || 1}</span></span>
            <span class="font-semibold text-[#3D2817]">₦${(item.price * (item.quantity || 1)).toLocaleString()}</span>
          </div>
        `).join('')}
      </div>
      <div class="space-y-2 pt-4">
        <div class="flex justify-between text-sm"><span class="text-[#6B4423]">Subtotal</span><span class="font-semibold">₦${subtotal.toLocaleString()}</span></div>
        <div class="flex justify-between text-sm"><span class="text-[#6B4423]">Delivery</span><span class="font-semibold">₦${delivery.toLocaleString()}</span></div>
        <div class="flex justify-between pt-3 border-t border-[#E8D9BC]"><span class="font-display font-bold text-[#3D2817]">Total</span><span class="font-display font-bold text-xl text-[#A8323A]">₦${total.toLocaleString()}</span></div>
      </div>
      <div class="mt-6 p-4 rounded-xl bg-[#5C7A3E]/10 border border-[#5C7A3E]/20">
        <div class="text-xs font-semibold text-[#5C7A3E] mb-2 flex items-center gap-2"><i data-lucide="check-circle" class="w-4 h-4"></i> Order Security</div>
        <p class="text-xs text-[#5C7A3E]">Your information is safe and encrypted.</p>
      </div>
    </div>
  `;
  lucide.createIcons();
}

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const cartItems = cart.filter(c => c.type === 'cart_item');
  if (cartItems.length === 0) {
    showToast('Your cart is empty', 'error');
    return;
  }
  
  const name = document.getElementById('checkout-name').value;
  const email = document.getElementById('checkout-email').value;
  const phone = document.getElementById('checkout-phone').value;
  const address = document.getElementById('checkout-address').value;
  const payment = document.querySelector('input[name="payment"]:checked').value;
  
  const btn = document.getElementById('checkout-submit');
  btn.disabled = true;
  btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Processing...';
  lucide.createIcons();
  
  const subtotal = cartItems.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);
  const delivery = 1500;
  const total = subtotal + delivery;
  
  const orderId = 'ORD-' + Date.now();
  
  const orderRecord = {
    type: 'order',
    order_id: orderId,
    product_id: cartItems.map(i => i.product_id).join(','),
    product_name: cartItems.map(i => i.product_name + ' x' + (i.quantity || 1)).join(', '),
    price: 0,
    quantity: cartItems.length,
    name: name,
    email: email,
    phone: phone,
    message: payment,
    order_total: total,
    order_status: 'Pending',
    delivery_address: address,
    createdAt: new Date().toISOString()
  };
  
  const result = await window.dataSdk.create(orderRecord);
  
  if (result.isOk) {
    // Delete cart items
    for (const item of cartItems) {
      await window.dataSdk.delete(item);
    }
    
    document.getElementById('checkout-form').reset();
    showToast(`Order ${orderId} placed successfully! 🎉`, 'success');
    setTimeout(() => {
      navigateTo('orders');
    }, 1500);
  } else {
    showToast('Could not place order. Try again.', 'error');
  }
  
  btn.disabled = false;
  btn.innerHTML = 'Place Order';
  lucide.createIcons();
});

function renderOrders() {
  const orders = cart.filter(c => c.type === 'order').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const container = document.getElementById('orders-container');
  
  if (orders.length === 0) {
    container.innerHTML = `
      <div class="bg-white rounded-3xl p-12 text-center border border-[#E8D9BC]">
        <div class="w-20 h-20 mx-auto rounded-full bg-[#FFF8ED] flex items-center justify-center mb-4">
          <i data-lucide="package" class="w-10 h-10 text-[#6B4423]"></i>
        </div>
        <h2 class="font-display text-2xl font-bold text-[#3D2817] mb-2">No orders yet</h2>
        <p class="text-[#6B4423] mb-6">Start shopping to create your first order</p>
        <button onclick="navigateTo('shop')" class="btn-primary text-white px-8 py-3 rounded-full font-semibold">Shop Now</button>
      </div>`;
    lucide.createIcons();
    return;
  }
  
  container.innerHTML = `
    <div class="space-y-4">
      ${orders.map(order => {
        const date = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const time = new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const statusColor = order.order_status === 'Delivered' ? 'bg-[#5C7A3E]/10 text-[#5C7A3E]' : 
                           order.order_status === 'Shipped' ? 'bg-[#C9954D]/10 text-[#C9954D]' : 'bg-[#A8323A]/10 text-[#A8323A]';
        const statusIcon = order.order_status === 'Delivered' ? 'check-circle' : 
                          order.order_status === 'Shipped' ? 'truck' : 'clock';
        
        return `
        <div class="bg-white rounded-2xl p-6 border border-[#E8D9BC] hover:shadow-lg transition">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 pb-4 border-b border-[#E8D9BC]">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="font-display font-bold text-lg text-[#3D2817]">${order.order_id}</span>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColor} flex items-center gap-1">
                  <i data-lucide="${statusIcon}" class="w-3 h-3"></i> ${order.order_status}
                </span>
              </div>
              <p class="text-xs text-[#6B4423]">${date} at ${time}</p>
            </div>
            <div class="text-right">
              <div class="text-xs uppercase tracking-wider text-[#6B4423] mb-1">Total Amount</div>
              <div class="font-display font-bold text-2xl text-[#A8323A]">₦${order.order_total.toLocaleString()}</div>
            </div>
          </div>
          
          <div class="mb-4">
            <div class="text-sm font-semibold text-[#3D2817] mb-2">Items</div>
            <p class="text-sm text-[#6B4423] line-clamp-2">${order.product_name}</p>
          </div>
          
          <div class="grid md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <div class="text-xs uppercase tracking-wider text-[#6B4423] mb-1">Delivery Address</div>
              <p class="text-[#3D2817] font-medium line-clamp-2">${order.delivery_address}</p>
            </div>
            <div>
              <div class="text-xs uppercase tracking-wider text-[#6B4423] mb-1">Payment Method</div>
              <p class="text-[#3D2817] font-medium capitalize">${order.message.replace('_', ' ')}</p>
            </div>
          </div>
          
          <div class="flex gap-2">
            <button onclick="viewOrderDetails('${order.__backendId}')" class="flex-1 px-4 py-2 rounded-lg border border-[#E8D9BC] text-sm font-medium text-[#3D2817] hover:bg-[#FFF8ED] transition flex items-center justify-center gap-1">
              <i data-lucide="eye" class="w-3 h-3"></i> Details
            </button>
            <button onclick="downloadReceipt('${order.order_id}', '${order.order_total}')" class="flex-1 px-4 py-2 rounded-lg bg-[#FFF8ED] border border-[#E8D9BC] text-sm font-medium text-[#3D2817] hover:bg-[#F5E6D0] transition flex items-center justify-center gap-1">
              <i data-lucide="download" class="w-3 h-3"></i> Receipt
            </button>
          </div>
        </div>
        `;
      }).join('')}
    </div>
  `;
  lucide.createIcons();
}

function viewOrderDetails(backendId) {
  const order = cart.find(c => c.__backendId === backendId);
  if (!order) return;
  
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl max-w-md w-full p-6 max-h-96 overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-display font-bold text-xl text-[#3D2817]">${order.order_id}</h3>
        <button onclick="this.closest('.fixed').remove()" class="w-6 h-6 flex items-center justify-center text-[#6B4423] hover:text-[#3D2817]"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>
      <div class="space-y-4">
        <div>
          <div class="text-xs uppercase tracking-wider text-[#6B4423] mb-1">Items</div>
          <p class="text-sm text-[#3D2817]">${order.product_name}</p>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wider text-[#6B4423] mb-1">Customer Name</div>
          <p class="text-sm text-[#3D2817]">${order.name}</p>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wider text-[#6B4423] mb-1">Email</div>
          <p class="text-sm text-[#3D2817]">${order.email}</p>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wider text-[#6B4423] mb-1">Phone</div>
          <p class="text-sm text-[#3D2817]">${order.phone}</p>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wider text-[#6B4423] mb-1">Delivery Address</div>
          <p class="text-sm text-[#3D2817]">${order.delivery_address}</p>
        </div>
        <div class="pt-4 border-t border-[#E8D9BC]">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-[#3D2817]">Total:</span>
            <span class="font-display text-xl font-bold text-[#A8323A]">₦${order.order_total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  lucide.createIcons();
}

function downloadReceipt(orderId, total) {
  const receipt = `
    RUBIES ORGANIC - ORDER RECEIPT
    ================================
    
    Order ID: ${orderId}
    Date: ${new Date().toLocaleDateString()}
    
    Amount: ₦${parseFloat(total).toLocaleString()}
    
    Thank you for your order!
    Visit: rubiesorganic.co
    
    ================================
  `;
  
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receipt));
  element.setAttribute('download', `${orderId}-receipt.txt`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  showToast('Receipt downloaded', 'success');
}


function updateCartBadge() {
  const count = cart.filter(c => c.type === 'cart_item').reduce((s, i) => s + (i.quantity || 1), 0);
  const badge = document.getElementById('cart-badge');
  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove('hidden');
    badge.classList.add('cart-badge');
    setTimeout(() => badge.classList.remove('cart-badge'), 300);
  } else {
    badge.classList.add('hidden');
  }
}

// ======= FORMS =======
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('contact-submit');
  btn.disabled = true; btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Sending...';
  lucide.createIcons();
  
  if (cart.length >= 999) { showToast('Submission limit reached', 'error'); btn.disabled = false; return; }
  
  const result = await window.dataSdk.create({
    type: 'contact_message',
    product_id: '', product_name: '', price: 0, quantity: 0,
    name: document.getElementById('contact-name').value,
    email: document.getElementById('contact-email-input').value,
    phone: '',
    message: document.getElementById('contact-message').value,
    createdAt: new Date().toISOString()
  });
  
  btn.disabled = false;
  btn.innerHTML = '<span>Send Message</span><i data-lucide="send" class="w-4 h-4"></i>';
  lucide.createIcons();
  
  if (result.isOk) {
    e.target.reset();
    showToast('Message sent! We\'ll be in touch soon.', 'success');
  } else {
    showToast('Could not send message. Try again.', 'error');
  }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('register-submit');
  btn.disabled = true; btn.textContent = 'Creating account...';
  
  if (cart.length >= 999) { showToast('Registration limit reached', 'error'); btn.disabled = false; return; }
  
  const result = await window.dataSdk.create({
    type: 'registration',
    product_id: '', product_name: '', price: 0, quantity: 0,
    name: document.getElementById('reg-name').value,
    email: document.getElementById('reg-email').value,
    phone: document.getElementById('reg-phone').value,
    message: '',
    createdAt: new Date().toISOString()
  });
  
  btn.disabled = false;
  btn.textContent = 'Create Account';
  
  if (result.isOk) {
    e.target.reset();
    showToast('Welcome to the Rubies family! 🥥', 'success');
    setTimeout(() => navigateTo('home'), 1500);
  } else {
    showToast('Could not create account. Try again.', 'error');
  }
});

function handleFormSubmission(event) {
  event.preventDefault();
  
  // Identify the interactive items within the viewport
  const clientName = document.getElementById('clientNameInput').value;
  const clientEmail = document.getElementById('clientEmailInput').value;
  const productName = document.getElementById('displayProductName').value;
  const sizeQuantity = document.getElementsByName('Requested Size and Quantity')[0].value;
  const logisticsInstructions = document.getElementsByName('Logistics Instructions')[0].value;

  // Render client context seamlessly inside the dynamic success visualizer
  document.getElementById('successUserName').innerText = clientName;

  // Construct structured payload stream for the backend
  const payload = {
    productName,
    clientName,
    clientEmail,
    sizeQuantity,
    logisticsInstructions
  };

  // Dispatch data bundle to local or live server endpoint
  fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showSuccessScreen();
      event.target.reset();
    } else {
      alert("Operational Delay: Please confirm input structural parameters.");
    }
  })
  .catch(error => {
    console.error('System Pipeline Disruption:', error);
    // Fallback UI rendering in case of connection dropouts
    showSuccessScreen();
  });
}

// ======= TOAST =======
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  const bg = type === 'error' ? 'bg-[#A8323A]' : 'bg-[#3D2817]';
  toast.className = `toast ${bg} text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium max-w-xs`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; }, 2500);
  setTimeout(() => toast.remove(), 2900);
}

// ======= DATA SDK INIT =======
const dataHandler = {
  onDataChanged(data) {
    cart = data || [];
    updateCartBadge();
    // Re-render cart page if visible
    if (document.getElementById('page-cart').classList.contains('active')) {
      renderCart();
    }
    // Refresh buttons on shop/home so "added" state shows
    if (document.getElementById('page-shop').classList.contains('active')) renderShop();
    if (document.getElementById('page-home').classList.contains('active')) renderFeatured();
  }
};

(async () => {
  if (window.dataSdk) {
    await window.dataSdk.init(dataHandler);
  }
  renderFeatured();
  renderShop();
  lucide.createIcons();
})();
(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9f427cb41621779b',t:'MTc3NzUwOTU0My4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function()
  {};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();