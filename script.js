// Sample currency data
const currencies = [
    { code: 'USD', name: 'US Dollar', flag: 'https://flagcdn.com/w40/us.png' },
    { code: 'EUR', name: 'Euro', flag: 'https://flagcdn.com/w40/eu.png' },
    { code: 'GBP', name: 'British Pound', flag: 'https://flagcdn.com/w40/gb.png' },
    { code: 'JPY', name: 'Japanese Yen', flag: 'https://flagcdn.com/w40/jp.png' },
    { code: 'AUD', name: 'Australian Dollar', flag: 'https://flagcdn.com/w40/au.png' },
    { code: 'CAD', name: 'Canadian Dollar', flag: 'https://flagcdn.com/w40/ca.png' },
    { code: 'CHF', name: 'Swiss Franc', flag: 'https://flagcdn.com/w40/ch.png' },
    { code: 'CNY', name: 'Chinese Yuan', flag: 'https://flagcdn.com/w40/cn.png' },
    { code: 'INR', name: 'Indian Rupee', flag: 'https://flagcdn.com/w40/in.png' },
    { code: 'MXN', name: 'Mexican Peso', flag: 'https://flagcdn.com/w40/mx.png' },
    { code: 'BRL', name: 'Brazilian Real', flag: 'https://flagcdn.com/w40/br.png' },
    { code: 'RUB', name: 'Russian Ruble', flag: 'https://flagcdn.com/w40/ru.png' },
    { code: 'KRW', name: 'South Korean Won', flag: 'https://flagcdn.com/w40/kr.png' },
    { code: 'SGD', name: 'Singapore Dollar', flag: 'https://flagcdn.com/w40/sg.png' },
    { code: 'NZD', name: 'New Zealand Dollar', flag: 'https://flagcdn.com/w40/nz.png' },
    { code: 'TRY', name: 'Turkish Lira', flag: 'https://flagcdn.com/w40/tr.png' },
    { code: 'ZAR', name: 'South African Rand', flag: 'https://flagcdn.com/w40/za.png' },
    { code: 'SEK', name: 'Swedish Krona', flag: 'https://flagcdn.com/w40/se.png' },
    { code: 'NOK', name: 'Norwegian Krone', flag: 'https://flagcdn.com/w40/no.png' },
    { code: 'DKK', name: 'Danish Krone', flag: 'https://flagcdn.com/w40/dk.png' }
];

// DOM elements
let fromCurrencySelect, toCurrencySelect, fromCurrencyDropdown, toCurrencyDropdown;
let amountInput, conversionResult, conversionTime, ratesTableBody;
let loginModal, signupModal, mobileMenu;
let exchangeChart;

// API key for exchange rate data
const API_KEY = '7b051dc735dd3101fb437918'; // Replace with a valid API key from a service like ExchangeRate-API or Open Exchange Rates
const API_BASE_URL = 'https://v6.exchangerate-api.com/v6/'; // Example API URL

// Store fetched exchange rates
let exchangeRates = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    // Initialize elements if they exist on the page
    fromCurrencySelect = document.getElementById('from-currency-select');
    toCurrencySelect = document.getElementById('to-currency-select');
    fromCurrencyDropdown = document.getElementById('from-currency-dropdown');
    toCurrencyDropdown = document.getElementById('to-currency-dropdown');
    amountInput = document.getElementById('amount');
    conversionResult = document.getElementById('conversion-result');
    conversionTime = document.getElementById('conversion-time');
    ratesTableBody = document.getElementById('rates-table-body');
    mobileMenu = document.getElementById('mobileMenu');

    // Only initialize converter functionality if on converter page
    if (fromCurrencySelect && toCurrencySelect) {
        // Populate currency dropdowns
        populateCurrencyDropdowns();

        // Fetch and populate exchange rates
        fetchExchangeRates().then(() => {
            // Populate rates table after fetching data
            populateRatesTable();

            // Initialize chart
            initChart();

            // Perform initial conversion
            convertCurrency();
        });
    }

    // Set up event listeners
    setupEventListeners();
});

// Fetch exchange rates from API
async function fetchExchangeRates() {
    const baseCurrency = 'USD'; // Using USD as the base for the table
    const url = `${API_BASE_URL}${API_KEY}/latest/${baseCurrency}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.result === 'success') {
            exchangeRates = data.conversion_rates;
            exchangeRates[baseCurrency] = 1; // Add the base currency itself
            conversionTime.textContent = `Last updated: ${new Date(data.time_last_update_utc).toLocaleTimeString()}`;
            console.log('Exchange rates fetched:', exchangeRates);
        } else {
            console.error('Failed to fetch exchange rates:', data['error-type']);
        }
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
    }
}

// Populate currency dropdowns with options
function populateCurrencyDropdowns() {
    if (!fromCurrencyDropdown || !toCurrencyDropdown) return;

    let fromDropdownHTML = '';
    let toDropdownHTML = '';

    currencies.forEach(currency => {
        fromDropdownHTML += `
            <div class="currency-option" data-code="${currency.code}">
                <img src="${currency.flag}" alt="${currency.code} Flag">
                <span>${currency.code} - ${currency.name}</span>
            </div>
        `;

        toDropdownHTML += `
            <div class="currency-option" data-code="${currency.code}">
                <img src="${currency.flag}" alt="${currency.code} Flag">
                <span>${currency.code} - ${currency.name}</span>
            </div>
        `;
    });

    fromCurrencyDropdown.innerHTML = fromDropdownHTML;
    toCurrencyDropdown.innerHTML = toDropdownHTML;

    // Add event listeners to dropdown options
    document.querySelectorAll('#from-currency-dropdown .currency-option').forEach(option => {
        option.addEventListener('click', function () {
            selectCurrency(this, 'from');
        });
    });

    document.querySelectorAll('#to-currency-dropdown .currency-option').forEach(option => {
        option.addEventListener('click', function () {
            selectCurrency(this, 'to');
        });
    });
}

// Select a currency in the dropdown
function selectCurrency(element, type) {
    const code = element.getAttribute('data-code');
    const currency = currencies.find(c => c.code === code);

    if (currency) {
        const selectBox = type === 'from' ? fromCurrencySelect : toCurrencySelect;
        selectBox.querySelector('img').src = currency.flag;
        selectBox.querySelector('span').textContent = `${currency.code} - ${currency.name}`;

        // Hide dropdown
        if (type === 'from') {
            fromCurrencyDropdown.style.display = 'none';
        } else {
            toCurrencyDropdown.style.display = 'none';
        }

        // Convert currency if both are selected
        if (fromCurrencySelect.querySelector('span').textContent !== 'Select Currency' &&
            toCurrencySelect.querySelector('span').textContent !== 'Select Currency') {
            convertCurrency();
        }
    }
}

// Toggle currency dropdown
function toggleDropdown(type) {
    const dropdown = type === 'from' ? fromCurrencyDropdown : toCurrencyDropdown;
    const otherDropdown = type === 'from' ? toCurrencyDropdown : fromCurrencyDropdown;

    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'block';
        otherDropdown.style.display = 'none';
    }
}

// Swap the from and to currencies
function swapCurrencies() {
    const fromImg = fromCurrencySelect.querySelector('img').src;
    const fromText = fromCurrencySelect.querySelector('span').textContent;

    const toImg = toCurrencySelect.querySelector('img').src;
    const toText = toCurrencySelect.querySelector('span').textContent;

    fromCurrencySelect.querySelector('img').src = toImg;
    fromCurrencySelect.querySelector('span').textContent = toText;

    toCurrencySelect.querySelector('img').src = fromImg;
    toCurrencySelect.querySelector('span').textContent = fromText;

    convertCurrency();
}

// Convert currency based on input
async function convertCurrency() {
    if (!fromCurrencySelect || !toCurrencySelect || !amountInput || !conversionResult) return;

    const fromCurrency = fromCurrencySelect.querySelector('span').textContent.split(' - ')[0];
    const toCurrency = toCurrencySelect.querySelector('span').textContent.split(' - ')[0];
    const amount = parseFloat(amountInput.value) || 0;

    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
        conversionResult.textContent = 'Exchange rates not available.';
        return;
    }

    // Get exchange rates
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];

    // Perform conversion
    const result = (amount / fromRate) * toRate;

    // Update result display
    conversionResult.textContent = `${amount} ${fromCurrency} = ${result.toFixed(4)} ${toCurrency}`;
    conversionTime.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

    // Update chart
    updateChart();
}

// Populate rates table with data
function populateRatesTable() {
    if (!ratesTableBody || Object.keys(exchangeRates).length === 0) return;

    let tableHTML = '';
    const baseCurrencyCode = 'USD'; // Assuming USD is the base currency
    const baseRate = exchangeRates[baseCurrencyCode];

    for (const [code, rate] of Object.entries(exchangeRates)) {
        if (code === baseCurrencyCode) continue; // Skip base currency

        const currency = currencies.find(c => c.code === code);
        if (!currency) continue;

        const usdEquivalent = rate / baseRate; // Calculate the rate against the base (USD)
        const change = (Math.random() * 0.5 - 0.25).toFixed(4); // Random change for demo
        const changeClass = change >= 0 ? 'positive' : 'negative';
        const changeIcon = change >= 0 ? '▲' : '▼';

        tableHTML += `
            <tr>
                <td><img src="${currency.flag}" alt="${code} Flag" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 0.5rem;">${currency.name}</td>
                <td>${code}</td>
                <td>${usdEquivalent.toFixed(4)}</td>
                <td class="${changeClass}">${changeIcon} ${Math.abs(change)}%</td>
            </tr>
        `;
    }

    ratesTableBody.innerHTML = tableHTML;
}

// Initialize the chart
function initChart() {
    const ctx = document.getElementById('exchangeChart');
    if (!ctx) return;

    const historicalData = { // Sample historical data for the chart
        '1D': [0.846, 0.847, 0.848, 0.849, 0.850, 0.851, 0.852, 0.853, 0.852, 0.851, 0.850, 0.849],
        '1W': [0.840, 0.842, 0.845, 0.847, 0.849, 0.851, 0.850],
        '1M': [0.830, 0.832, 0.835, 0.838, 0.840, 0.842, 0.845, 0.847, 0.849, 0.851, 0.853, 0.852, 0.851, 0.850, 0.849, 0.848, 0.847, 0.846, 0.845, 0.846, 0.847, 0.848, 0.849, 0.850, 0.851, 0.852, 0.853, 0.854, 0.855, 0.854],
        '1Y': [0.820, 0.825, 0.830, 0.835, 0.840, 0.845, 0.850, 0.855, 0.860, 0.855, 0.850, 0.845],
        'Max': [0.800, 0.810, 0.820, 0.830, 0.840, 0.850, 0.860, 0.870, 0.860, 0.850, 0.840, 0.850]
    };

    exchangeChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: Array.from({ length: historicalData['1D'].length }, (_, i) => `${i}:00`),
            datasets: [{
                label: 'Exchange Rate',
                data: historicalData['1D'],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Update chart based on selected time frame
function updateChart() {
    if (!exchangeChart || !fromCurrencySelect || !toCurrencySelect) return;

    const fromCurrency = fromCurrencySelect.querySelector('span').textContent.split(' - ')[0];
    const toCurrency = toCurrencySelect.querySelector('span').textContent.split(' - ')[0];

    // Update chart title
    exchangeChart.data.datasets[0].label = `${fromCurrency}/${toCurrency} Exchange Rate`;
    exchangeChart.update();
}

// Set up event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuClose = document.getElementById('mobileMenuClose');

    if (mobileMenuBtn && mobileMenuClose) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.add('open');
        });

        mobileMenuClose.addEventListener('click', function () {
            mobileMenu.classList.remove('open');
        });
    }

    // Currency dropdown toggles
    if (fromCurrencySelect && toCurrencySelect) {
        fromCurrencySelect.addEventListener('click', () => toggleDropdown('from'));
        toCurrencySelect.addEventListener('click', () => toggleDropdown('to'));

        // Close dropdowns when clicking outside
        document.addEventListener('click', function (e) {
            if (fromCurrencySelect && !fromCurrencySelect.contains(e.target) && fromCurrencyDropdown && !fromCurrencyDropdown.contains(e.target)) {
                fromCurrencyDropdown.style.display = 'none';
            }
            if (toCurrencySelect && !toCurrencySelect.contains(e.target) && toCurrencyDropdown && !toCurrencyDropdown.contains(e.target)) {
                toCurrencyDropdown.style.display = 'none';
            }
        });

        // Amount input change
        amountInput.addEventListener('input', convertCurrency);
    }

    // Time filter buttons
    const timeFilterButtons = document.querySelectorAll('.time-filters button');
    timeFilterButtons.forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('.time-filters button').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Update chart based on selected time frame
            const timeFrame = this.textContent;
            const historicalData = { // Sample historical data for the chart
                '1D': [0.846, 0.847, 0.848, 0.849, 0.850, 0.851, 0.852, 0.853, 0.852, 0.851, 0.850, 0.849],
                '1W': [0.840, 0.842, 0.845, 0.847, 0.849, 0.851, 0.850],
                '1M': [0.830, 0.832, 0.835, 0.838, 0.840, 0.842, 0.845, 0.847, 0.849, 0.851, 0.853, 0.852, 0.851, 0.850, 0.849, 0.848, 0.847, 0.846, 0.845, 0.846, 0.847, 0.848, 0.849, 0.850, 0.851, 0.852, 0.853, 0.854, 0.855, 0.854],
                '1Y': [0.820, 0.825, 0.830, 0.835, 0.840, 0.845, 0.850, 0.855, 0.860, 0.855, 0.850, 0.845],
                'Max': [0.800, 0.810, 0.820, 0.830, 0.840, 0.850, 0.860, 0.870, 0.860, 0.850, 0.840, 0.850]
            };
            if (exchangeChart) {
                exchangeChart.data.labels = Array.from({ length: historicalData[timeFrame].length }, (_, i) => {
                    if (timeFrame === '1D') return `${i}:00`;
                    if (timeFrame === '1W') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i];
                    if (timeFrame === '1M') return `Day ${i + 1}`;
                    if (timeFrame === '1Y') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i];
                    return `Year ${i + 1}`;
                });
                exchangeChart.data.datasets[0].data = historicalData[timeFrame];
                exchangeChart.update();
            }
        });
    });
}

// Login function
function login() {
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    if (!email || !password) return;

    // Simple validation
    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
        document.getElementById('email-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('email-error').style.display = 'none';
    }

    if (!password.value || password.value.length < 8) {
        document.getElementById('password-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('password-error').style.display = 'none';
    }

    if (isValid) {
        // In a real app, this would be an API call to authenticate
        alert('Login successful!');
        // Redirect to home page
        window.location.href = 'index.html';
    }
}

// Signup function
function signup() {
    const fullname = document.getElementById('fullname');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');

    if (!fullname || !email || !password || !confirmPassword) return;

    // Simple validation
    let isValid = true;

    if (!fullname.value) {
        document.getElementById('fullname-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('fullname-error').style.display = 'none';
    }

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
        document.getElementById('email-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('email-error').style.display = 'none';
    }

    if (!password.value || password.value.length < 8) {
        document.getElementById('password-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('password-error').style.display = 'none';
    }

    if (password.value !== confirmPassword.value) {
        document.getElementById('confirm-password-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('confirm-password-error').style.display = 'none';
    }

    if (isValid) {
        // In a real app, this would be an API call to register
        alert('Account created successfully!');
        // Redirect to home page
        window.location.href = 'index.html';
    }
}