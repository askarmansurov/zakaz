let cart = JSON.parse(localStorage.getItem('cart') || "[]");
updateCartCount();
displayCart();

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  document.querySelectorAll('#cart-count').forEach(span => {
    span.textContent = cart.length;
  });
}

function addToCart(name, price, category) {
  if (confirm(`Добавить ${name} в корзину за ${price}₸?`)) {
    cart.push({ name, price, category });
    saveCart();
    alert(`${name} добавлен в корзину.`);
  }
}

function removeFromCart(name) {
  if (confirm(`Удалить один ${name} из корзины?`)) {
    const index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
      cart.splice(index, 1);
      saveCart();
      alert(`${name} удалён.`);
    } else {
      alert(`${name} не найден в корзине.`);
    }
    if (document.getElementById('cart-items')) displayCart();
  }
}

function clearCart() {
  if (confirm("Очистить всю корзину?")) {
    cart = [];
    saveCart();
    alert("Корзина очищена.");
    location.reload();
  }
}

function displayCart() {
  const container = document.getElementById('cart-items');
  const totalBlock = document.getElementById('cart-total');
  if (!container) return;

  container.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = "<p>Корзина пуста.</p>";
    totalBlock.textContent = "";
    return;
  }

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.price}₸</p>
      <button onclick="removeFromCart('${item.name}')">Удалить</button>
    `;
    container.appendChild(div);
    total += item.price;
  });

  totalBlock.textContent = `Итого: ${total}₸`;
}

// === ФИЛЬТРАЦИЯ ===
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const categorySelect = document.getElementById('category');

if (searchInput) searchInput.addEventListener('input', filterProducts);
if (sortSelect) sortSelect.addEventListener('change', filterProducts);
if (categorySelect) categorySelect.addEventListener('change', filterProducts);

function filterProducts() {
  const query = (searchInput ? searchInput.value.toLowerCase() : "");
  const sort = sortSelect ? sortSelect.value : "";
  const category = categorySelect ? categorySelect.value : "";

  let products = Array.from(document.querySelectorAll('.product'));

  products.forEach(prod => {
    const text = prod.textContent.toLowerCase();
    const prodCategory = prod.getAttribute('data-category');
    let visible = (!query || text.includes(query)) &&
                  (!category || prodCategory === category);
    prod.style.display = visible ? "block" : "none";
  });

  if (sort) {
    let sorted = products.filter(prod => prod.style.display !== "none");
    sorted.sort((a, b) => {
      let aPrice = parseInt(a.getAttribute('data-price'));
      let bPrice = parseInt(b.getAttribute('data-price'));
      return sort === "price-asc" ? aPrice - bPrice : bPrice - aPrice;
    });
    const container = products[0].parentNode;
    sorted.forEach(prod => container.appendChild(prod));
  }
}

// === ГОЛОСОВОЙ ПОИСК ===
function startVoiceSearch() {
  const recognition = new(window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "ru-RU";
  recognition.start();
  recognition.onresult = function(event) {
    if (searchInput) {
      searchInput.value = event.results[0][0].transcript;
      filterProducts();
      showAutocomplete({ target: searchInput });
    }
  }
}

// === ТЕМА ===
function toggleTheme() {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
}
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light');
}

// === АВТОКОМПЛИТ ===
const allProducts = ["Компьютер", "Видеокарта", "Флешка", "Процессор"];
const autocompleteBox = document.createElement('div');
autocompleteBox.className = 'autocomplete-box';
document.body.appendChild(autocompleteBox);

if (searchInput) {
  searchInput.addEventListener('input', showAutocomplete);
  document.addEventListener('click', () => autocompleteBox.style.display = 'none');
}

function showAutocomplete(e) {
  const query = e.target.value.toLowerCase();
  if (!query) {
    autocompleteBox.style.display = 'none';
    return;
  }

  const matches = allProducts.filter(item =>
    item.toLowerCase().includes(query)
  );

  autocompleteBox.innerHTML = '';
  matches.forEach(item => {
    const div = document.createElement('div');
    div.className = 'autocomplete-item';
    div.textContent = item;
    div.onclick = () => {
      searchInput.value = item;
      filterProducts();
      autocompleteBox.style.display = 'none';
    };
    autocompleteBox.appendChild(div);
  });

  if (matches.length > 0) {
    const rect = searchInput.getBoundingClientRect();
    autocompleteBox.style.left = rect.left + 'px';
    autocompleteBox.style.top = (rect.bottom + window.scrollY) + 'px';
    autocompleteBox.style.width = rect.width + 'px';
    autocompleteBox.style.display = 'block';
  } else {
    autocompleteBox.style.display = 'none';
  }
}

// === ВСПЛЫВАЮЩАЯ ЛЕНТА ИСТОРИИ ===
document.addEventListener("DOMContentLoaded", () => {
  const pageHistory = JSON.parse(localStorage.getItem('pageHistory') || "[]");
  const currentPage = window.location.pathname.split("/").pop();

  if (!pageHistory.includes(currentPage)) {
    pageHistory.push(currentPage);
    localStorage.setItem('pageHistory', JSON.stringify(pageHistory));
  }

  if (pageHistory.length > 1) {
    const pageNames = {
      "index.html": "Главная",
      "catalog.html": "Каталог",
      "about.html": "О нас",
      "contacts.html": "Контакты",
      "cart.html": "Корзина",
      "product-computer.html": "Компьютер",
      "product-videocard.html": "Видеокарта",
      "product-flash.html": "Флешка",
      "product-processor.html": "Процессор",
      "pilot.html": "Pilot",
      "acer.html": "Acer",
      "zhigulenok.html": "Жигуленок",
      "gigabyte.html": "Gigabyte",
      "offline.html": "Оффлайн"
    };

    const toggleLink = document.createElement('div');
    toggleLink.textContent = "история посещения →";
    toggleLink.style.position = "fixed";
    toggleLink.style.bottom = "20px";
    toggleLink.style.left = "20px";
    toggleLink.style.zIndex = "1001";
    toggleLink.style.fontSize = "14px";
    toggleLink.style.color = "#ccc";
    toggleLink.style.cursor = "pointer";
    toggleLink.style.fontFamily = "Verdana, sans-serif";
    document.body.appendChild(toggleLink);

    const historyBox = document.createElement('div');
    historyBox.style.display = "none";
    historyBox.style.position = "fixed";
    historyBox.style.bottom = "0";
    historyBox.style.left = "0";
    historyBox.style.right = "0";
    historyBox.style.background = "#000";
    historyBox.style.borderTop = "2px solid #fff";
    historyBox.style.padding = "14px 20px";
    historyBox.style.zIndex = "1000";
    historyBox.style.overflowX = "auto";
    historyBox.style.whiteSpace = "nowrap";
    historyBox.style.color = "#fff";
    historyBox.style.fontFamily = "Verdana, sans-serif";
    historyBox.style.fontSize = "20px";
    historyBox.style.boxShadow = "0 0 15px rgba(255,255,255,0.2)";
    historyBox.style.transform = "perspective(600px) rotateX(2deg)";
    historyBox.style.scrollbarWidth = "thin";

    const notification = document.createElement('span');
    notification.innerHTML = "🗂 <strong>Вы были здесь:</strong> ";
    notification.style.marginRight = "15px";
    historyBox.appendChild(notification);

    pageHistory.forEach(page => {
      const link = document.createElement('a');
      link.href = page;
      link.textContent = pageNames[page] || page.replace('.html', '').replace('-', ' ').toUpperCase();
      link.style.margin = "0 12px";
      link.style.display = "inline-block";
      link.style.color = "#fff";
      link.style.transition = "all 0.3s ease";
      link.style.textShadow = "0 0 5px #aaa";
      link.onmouseover = () => {
        link.style.transform = "scale(1.2)";
        link.style.textShadow = "0 0 15px #fff";
      };
      link.onmouseout = () => {
        link.style.transform = "scale(1)";
        link.style.textShadow = "0 0 5px #aaa";
      };
      historyBox.appendChild(link);
    });

    document.body.appendChild(historyBox);

    toggleLink.onclick = () => {
      if (historyBox.style.display === "none") {
        historyBox.style.display = "block";
        toggleLink.textContent = "← закрыть историю";
      } else {
        historyBox.style.display = "none";
        toggleLink.textContent = "история посещения →";
      }
    };

    const style = document.createElement('style');
    style.textContent = `
      .history-box::-webkit-scrollbar {
        height: 0;
      }
      .history-box:hover::-webkit-scrollbar {
        height: 24px;
      }
      .history-box {
        scrollbar-width: none;
      }
      .history-box:hover {
        scrollbar-width: thin;
      }
      .history-box::-webkit-scrollbar-thumb {
        background: #fff;
        border-radius: 12px;
      }
      .history-box::-webkit-scrollbar-track {
        background: #222;
      }
    `;
    document.head.appendChild(style);
  }
});
