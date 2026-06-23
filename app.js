const API = "https://two00000-plus-products-listing-backend.onrender.com/products";

let cursor = null;
let category = "";
let search = "";
let loading = false;

const grid = document.getElementById("grid");
const categorySelect = document.getElementById("category");
const searchInput = document.getElementById("search");
const loader = document.getElementById("loader");
const empty = document.getElementById("empty");

// categories
const categories = [
  "Shoes", "Jeans", "Watches", "Pet Supplies",
  "School Bags", "Trousers", "Toys", "Home Decor"
];

const icons = {
  Shoes: "fa-person-running",
  Jeans: "fa-shirt",
  Watches: "fa-clock",
  "Pet Supplies": "fa-dog",
  "School Bags": "fa-briefcase",
  Trousers: "fa-socks",
  Toys: "fa-puzzle-piece",
  "Home Decor": "fa-couch",
  default: "fa-box"
};

categories.forEach(c => {
  const opt = document.createElement("option");
  opt.value = c;
  opt.textContent = c;
  categorySelect.appendChild(opt);
});

categorySelect.addEventListener("change", (e) => {
  category = e.target.value;
});

searchInput.addEventListener("input", debounce((e) => {
  search = e.target.value.trim();
  cursor = null;
  grid.innerHTML = "";
  fetchProducts(true);
}, 400));

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// dummy image generator
function getIcon(category) {
  return icons[category] || icons.default;
}

function skeleton() {
  return `
    <div class="bg-white p-4 rounded-lg shadow animate-pulse h-32"></div>
  `;
}

function createCard(p) {
  const icon = getIcon(p.category);

  return `
    <div class="bg-white rounded-xl p-4 shadow card-hover border">

      <div class="flex items-center justify-between">
        <i class="fa-solid ${icon} text-blue-500 text-xl"></i>
        <span class="text-xs bg-gray-100 px-2 py-1 rounded">${p.category}</span>
      </div>

      <h2 class="font-semibold mt-3 text-sm line-clamp-2">
        ${p.name}
      </h2>

      <p class="text-xs text-gray-500 mt-1">${p.brand}</p>

      <div class="flex justify-between items-center mt-3">
        <span class="font-bold text-blue-600">₹${p.price}</span>
        <i class="fa-regular fa-heart text-gray-400"></i>
      </div>

    </div>
  `;
}

function showLoader(show) {
  loader.classList.toggle("hidden", !show);
}

function showEmpty(show) {
  empty.classList.toggle("hidden", !show);
}

async function fetchProducts(reset = false) {
  if (loading) return;
  loading = true;

  showLoader(true);
  showEmpty(false);

  let url = `${API}?limit=20`;

  if (cursor && !reset) {
    url += `&cursor=${encodeURIComponent(cursor)}`;
  }

  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }

  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  cursor = data.next_cursor;

  if (reset) grid.innerHTML = "";

  if (!data.products.length && reset) {
    showEmpty(true);
  }

  data.products.forEach(p => {
    grid.innerHTML += createCard(p);
  });

  showLoader(false);
  loading = false;
}

// reset
function resetAndFetch() {
  cursor = null;
  grid.innerHTML = "";
  fetchProducts(true);
}

// infinite scroll (better than button)
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    fetchProducts(false);
  }
});

// initial load
fetchProducts(true);