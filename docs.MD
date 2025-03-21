Sure! Here's a technical documentation guide for **Cursor AI** to help you build a **Landing Page that fetches current gold prices from PNJ** and calculates the final product price based on gold type, weight, and forging fee.

---

# 📄 Cursor AI Project Documentation

## 🎯 Project Objective
Create a **landing page** to:
- Fetch real-time **gold price data** from [https://giavang.pnj.com.vn/](https://giavang.pnj.com.vn/)
- Allow users to input:
  - Gold Type (e.g. SJC 9999, 18K, 24K, etc.)
  - Gold Weight (in **chi** or **grams**)
  - Forging Fee (fee charged by the jewelry shop)
- Calculate and display the **final product price**

---

## 🔧 Tech Stack
- **Frontend**: HTML, CSS, JavaScript (React if applicable)
- **Backend**: Node.js (optional if using client-side fetch)
- **Data Source**: [https://giavang.pnj.com.vn/](https://giavang.pnj.com.vn/) – requires scraping or fetching exposed API

---

## 🔌 Step 1: Fetch Gold Price

### A. Inspect Source
Open https://giavang.pnj.com.vn/, inspect Network > Fetch/XHR. You'll likely find a JSON response from something like:
```
https://giavang.pnj.com.vn/api/public/gold-price
```

### B. Sample Response Structure (Mock Example)
```json
{
  "items": [
    {
      "type": "SJC 9999",
      "buy": 7400000,
      "sell": 7450000
    },
    {
      "type": "PNJ 18K",
      "buy": 5300000,
      "sell": 5500000
    }
  ]
}
```

> ⚠️ This structure may vary — inspect the actual JSON when implementing.

### C. Fetch Code Sample (JS)
```js
async function fetchGoldPrices() {
  const response = await fetch("https://giavang.pnj.com.vn/api/public/gold-price");
  const data = await response.json();
  return data.items;
}
```

---

## 🧮 Step 2: Create Final Price Calculator

### Input Fields:
- **Gold Type**: Dropdown (e.g. “SJC 9999”, “PNJ 18K”)
- **Gold Weight**: Number input (in **chi** or grams)
- **Forging Fee**: Number input (₫)

### Calculation Formula:
```js
final_price = (gold_sell_price_per_chi * gold_weight) + forging_fee;
```

> 📝 1 **chi** = 3.75 grams, convert if needed.

### Code Example:
```js
function calculatePrice(goldPricePerChi, weight, forgingFee) {
  return (goldPricePerChi * weight) + forgingFee;
}
```

---

## 💻 Step 3: UI Layout (HTML Example)
```html
<h1>Cập Nhật Giá Vàng PNJ</h1>

<select id="goldType"></select>
<input type="number" id="weight" placeholder="Khối lượng (chỉ)">
<input type="number" id="fee" placeholder="Phí gia công (₫)">
<button onclick="handleCalculate()">Tính giá</button>

<h2 id="result">Giá thành phẩm: </h2>
```

### JavaScript Logic
```js
let goldPrices = [];

async function init() {
  goldPrices = await fetchGoldPrices();
  const select = document.getElementById("goldType");

  goldPrices.forEach(item => {
    const option = document.createElement("option");
    option.value = item.type;
    option.textContent = `${item.type} - Bán: ${item.sell.toLocaleString()}₫`;
    select.appendChild(option);
  });
}

function handleCalculate() {
  const type = document.getElementById("goldType").value;
  const weight = parseFloat(document.getElementById("weight").value);
  const fee = parseInt(document.getElementById("fee").value);

  const selected = goldPrices.find(p => p.type === type);
  if (!selected) return alert("Chọn loại vàng hợp lệ!");

  const price = calculatePrice(selected.sell, weight, fee);
  document.getElementById("result").textContent = `Giá thành phẩm: ${price.toLocaleString()}₫`;
}

window.onload = init;
```

---

## ✅ Optional Features
- Toggle between grams and **chi**
- Historical chart of gold price (store previous results locally)
- Validate user inputs
- Auto-refresh gold price every 5 minutes

---

## 📦 Folder Structure Suggestion
```
cursor-gold-calculator/
├── index.html
├── styles.css
├── script.js
└── README.md
```

---

## 📌 Notes
- Gold prices update frequently. Ensure to **cache** for 5 minutes to reduce network requests.
- Handle CORS properly (if PNJ blocks fetch, use backend proxy).
- Always validate external API changes.

---

Would you like me to generate the actual `index.html`, `script.js`, and `styles.css` files so you can copy-paste and run it directly in Cursor?