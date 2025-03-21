// Constants
const CHI_TO_GRAM = 3.75;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const API_URL =
  "https://api.allorigins.win/raw?url=https://giavang.pnj.com.vn/";
const PRICE_PER_CHI = 10; // Prices are for 10 Chỉ

// Debug flag
const DEBUG = true;

// Debug logging function
function debugLog(...args) {
  if (DEBUG) {
    console.log("[DEBUG]", ...args);
  }
}

// State
let goldPrices = [];
let lastFetchTime = 0;
let currentUnit = "chi";
let isFetching = false;

// DOM Elements
const goldTypeSelect = document.getElementById("goldType");
const weightInput = document.getElementById("weight");
const feeInput = document.getElementById("fee");
const calculateBtn = document.getElementById("calculateBtn");
const resultDiv = document.getElementById("result");
const currentPriceSpan = document.getElementById("currentPrice");
const finalPriceSpan = document.getElementById("finalPrice");
const updateTimeSpan = document.getElementById("updateTime");
const unitToggleButtons = document.querySelectorAll(".unit-toggle button");

// Utility Functions
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function updateTimeDisplay() {
  const now = new Date();
  updateTimeSpan.textContent = now.toLocaleTimeString("vi-VN");
}

function convertWeight(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return value;
  return fromUnit === "chi" ? value * CHI_TO_GRAM : value / CHI_TO_GRAM;
}

// API Functions
async function fetchGoldPrices() {
  if (isFetching) {
    debugLog("Already fetching prices, skipping...");
    return null;
  }

  isFetching = true;
  try {
    debugLog("Starting fetchGoldPrices");
    debugLog("Fetching from URL:", API_URL);

    const response = await fetch(API_URL);
    debugLog("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const html = await response.text();
    if (!html || html.length === 0) {
      throw new Error("Empty response received");
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    debugLog("Document parsed successfully");

    // Find all tables in the document
    const tables = doc.querySelectorAll("table");
    debugLog("Found tables:", tables.length);

    // Look for the table containing gold prices
    let targetTable = null;
    for (const table of tables) {
      const text = table.textContent.toLowerCase();
      if (text.includes("giá vàng") || text.includes("vàng nữ trang")) {
        targetTable = table;
        debugLog("Found target table with gold prices");
        break;
      }
    }

    if (!targetTable) {
      throw new Error("Could not find gold price table");
    }

    const prices = [];
    const rows = targetTable.querySelectorAll("tr");
    debugLog("Found rows:", rows.length);

    let isTPHCM = false;
    let isJewelrySection = false;

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.querySelectorAll("td");

      if (cells.length >= 3) {
        const firstCell = cells[0].textContent.trim();
        const secondCell = cells[1].textContent.trim();

        // Check if we're in TPHCM section
        if (firstCell === "TPHCM") {
          isTPHCM = true;
          debugLog("Found TPHCM section");
          continue;
        }

        // Check if we're in jewelry section
        if (firstCell === "Giá vàng nữ trang") {
          isJewelrySection = true;
          debugLog("Found jewelry section");
          continue;
        }

        // Process PNJ and SJC prices from TPHCM
        if (isTPHCM && !isJewelrySection) {
          if (secondCell === "PNJ" || secondCell === "SJC") {
            const type = `${secondCell} ${firstCell}`;
            const buyText = cells[2].textContent.trim();
            const sellText = cells[3].textContent.trim();

            debugLog(`Processing TPHCM price:`, {
              type,
              buyText,
              sellText,
              rawCells: Array.from(cells).map((c) => c.textContent.trim()),
              isTPHCM,
              isJewelrySection,
            });

            // Remove dots, parse as float, and multiply by 1000
            const buy = parseFloat(buyText.replace(/\./g, "")) * 1000;
            const sell = parseFloat(sellText.replace(/\./g, "")) * 1000;

            if (type && !isNaN(buy) && !isNaN(sell)) {
              prices.push({
                type,
                buy,
                sell,
              });
              debugLog(`Added TPHCM price for:`, type);
            } else {
              debugLog(`Failed to add price for:`, type, {
                buy,
                sell,
                buyText,
                sellText,
              });
            }
          }
        }

        // Process jewelry prices
        if (isTPHCM && isJewelrySection) {
          const type = cells[0].textContent.trim();
          const buyText = cells[1].textContent.trim();
          const sellText = cells[2].textContent.trim();

          debugLog(`Processing jewelry price:`, { type, buyText, sellText });

          // Remove dots, parse as float, and multiply by 1000
          const buy = parseFloat(buyText.replace(/\./g, "")) * 1000;
          const sell = parseFloat(sellText.replace(/\./g, "")) * 1000;

          if (type && !isNaN(buy) && !isNaN(sell)) {
            prices.push({
              type,
              buy,
              sell,
            });
            debugLog(`Added jewelry price for:`, type);
          }
        }
      }
    }

    // Sort prices to show PNJ and SJC first, then jewelry prices
    prices.sort((a, b) => {
      if (a.type.includes("PNJ") || a.type.includes("SJC")) {
        return -1;
      }
      if (b.type.includes("PNJ") || b.type.includes("SJC")) {
        return 1;
      }
      return 0;
    });

    debugLog("Final extracted prices:", prices);
    return prices;
  } catch (error) {
    console.error("Error in fetchGoldPrices:", error);
    debugLog("Error stack:", error.stack);
    return null;
  } finally {
    isFetching = false;
  }
}

async function updateGoldPrices() {
  debugLog("Starting updateGoldPrices");
  const now = Date.now();
  debugLog("Cache check:", {
    now,
    lastFetchTime,
    timeSinceLastFetch: now - lastFetchTime,
    cacheDuration: CACHE_DURATION,
    hasPrices: goldPrices.length > 0,
  });

  if (now - lastFetchTime < CACHE_DURATION && goldPrices.length > 0) {
    debugLog("Using cached prices");
    return;
  }

  const prices = await fetchGoldPrices();
  if (prices) {
    goldPrices = prices;
    lastFetchTime = now;
    debugLog("Updated gold prices:", prices);
    updateGoldTypeOptions();
    updateTimeDisplay();
  } else {
    debugLog("Failed to update gold prices");
    // Show error message to user
    const errorMessage = "Không thể cập nhật giá vàng. Vui lòng thử lại sau.";
    goldTypeSelect.innerHTML = `<option value="">${errorMessage}</option>`;
  }
}

function updateGoldTypeOptions() {
  debugLog("Starting updateGoldTypeOptions");
  debugLog("Current gold prices:", goldPrices);

  if (!goldPrices || goldPrices.length === 0) {
    console.warn("No gold prices available");
    goldTypeSelect.innerHTML = '<option value="">Chọn loại vàng</option>';
    return;
  }

  goldTypeSelect.innerHTML = '<option value="">Chọn loại vàng</option>';
  goldPrices.forEach((item, index) => {
    debugLog(`Processing item ${index}:`, item);
    if (item && item.type && !isNaN(item.sell)) {
      const option = document.createElement("option");
      option.value = item.type;
      option.textContent = `${item.type} - Bán: ${formatNumber(item.sell)}₫`;
      goldTypeSelect.appendChild(option);
      debugLog(`Added option:`, option.textContent);
    } else {
      debugLog(`Skipped invalid item ${index}:`, item);
    }
  });
}

// Calculation Functions
function calculatePrice() {
  const selectedType = goldTypeSelect.value;
  const weight = parseFloat(weightInput.value);
  const fee = parseFloat(feeInput.dataset.rawValue || "0");

  if (!selectedType || isNaN(weight)) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const selectedGold = goldPrices.find((p) => p.type === selectedType);
  if (!selectedGold) {
    alert("Vui lòng chọn loại vàng hợp lệ!");
    return;
  }

  const weightInChi =
    currentUnit === "chi" ? weight : convertWeight(weight, "gram", "chi");
  // Current price is for 10 Chỉ
  const finalPrice = (selectedGold.sell / 10) * weightInChi + fee;

  // Show price with thousands in the current price display
  currentPriceSpan.textContent = formatNumber(selectedGold.sell / 10);
  finalPriceSpan.textContent = formatNumber(finalPrice);
  resultDiv.style.display = "block";
}

// Event Listeners
calculateBtn.addEventListener("click", calculatePrice);

// Format fee input display while keeping raw value
feeInput.addEventListener("input", function (e) {
  // Remove all non-digit characters
  let value = this.value.replace(/\D/g, "");

  // Store the raw value in a data attribute
  this.dataset.rawValue = value;

  // Display formatted value
  if (value) {
    this.value = formatNumber(parseInt(value));
  }
});

// Format fee input when focus is lost
feeInput.addEventListener("blur", function (e) {
  let value = this.dataset.rawValue || "";
  if (value) {
    this.value = formatNumber(parseInt(value));
  }
});

unitToggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    unitToggleButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentUnit = button.dataset.unit;

    // Convert the current weight value if it exists
    if (weightInput.value) {
      const currentValue = parseFloat(weightInput.value);
      const newValue = convertWeight(
        currentValue,
        currentUnit === "chi" ? "gram" : "chi",
        currentUnit
      );
      weightInput.value = newValue.toFixed(2);
    }
  });
});

// Initialize
async function init() {
  await updateGoldPrices();
  setInterval(updateTimeDisplay, 1000);
}

init();
