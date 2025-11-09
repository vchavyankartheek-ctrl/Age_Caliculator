// Month names array
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// DOM elements
const daySelect = document.getElementById('daySelect');
const monthSelect = document.getElementById('monthSelect');
const yearSelect = document.getElementById('yearSelect');
const dateInputButton = document.getElementById('dateInputButton');
const dateDisplay = document.getElementById('dateDisplay');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const resultSection = document.getElementById('resultSection');
const resultContent = document.getElementById('resultContent');
const errorMessage = document.getElementById('errorMessage');

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    populateDropdowns();
    loadLastCalculation();
    setupEventListeners();
});

// Populate dropdowns
function populateDropdowns() {
    // Populate day dropdown (1-31)
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
    
    // Populate month dropdown (January-December)
    monthNames.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    
    // Populate year dropdown (2025 to 1947 in descending order)
    for (let year = 2025; year >= 1947; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Click on input button focuses day dropdown
    dateInputButton.addEventListener('click', function() {
        daySelect.focus();
        daySelect.click();
    });
    
    // Change events on dropdowns
    daySelect.addEventListener('change', updateDateDisplay);
    monthSelect.addEventListener('change', updateDateDisplay);
    yearSelect.addEventListener('change', updateDateDisplay);
    
    // Calculate button click
    calculateBtn.addEventListener('click', calculateAge);
    
    // Reset button click
    resetBtn.addEventListener('click', resetCalculator);
    
    // Validate on any change
    [daySelect, monthSelect, yearSelect].forEach(select => {
        select.addEventListener('change', validateInputs);
    });
}

// Update date display in input button
function updateDateDisplay() {
    const day = daySelect.value ? String(daySelect.value).padStart(2, '0') : '00';
    const month = monthSelect.value !== '' ? String(parseInt(monthSelect.value) + 1).padStart(2, '0') : '00';
    const year = yearSelect.value || '0000';
    
    dateDisplay.textContent = `${day}/${month}/${year}`;
    
    // Validate day options for selected month/year
    validateDayForMonth();
    
    // Validate date combination
    validateDateCombination();
}

// Validate inputs and enable/disable calculate button
function validateInputs() {
    const day = daySelect.value;
    const month = monthSelect.value;
    const year = yearSelect.value;
    
    if (day && month !== '' && year) {
        if (validateDateCombination()) {
            calculateBtn.disabled = false;
        } else {
            calculateBtn.disabled = true;
        }
    } else {
        calculateBtn.disabled = true;
    }
}

// Validate date combination
function validateDateCombination() {
    const day = parseInt(daySelect.value);
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    
    if (!day || month === '' || !year) {
        return true; // Allow empty fields
    }
    
    // Check if date is valid
    const daysInMonth = getDaysInMonth(month, year);
    
    if (day > daysInMonth) {
        showError('Invalid date! Please select a valid day for the chosen month.');
        return false;
    }
    
    // Check for future date
    const selectedDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
        showError('Please select a date in the past.');
        return false;
    }
    
    hideError();
    return true;
}

// Get days in month (accounting for leap years)
function getDaysInMonth(month, year) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Check for leap year in February
    if (month === 1 && isLeapYear(year)) {
        return 29;
    }
    
    return daysInMonth[month];
}

// Check if year is a leap year
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Calculate age
function calculateAge() {
    const day = parseInt(daySelect.value);
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    
    // Validate all fields are filled
    if (!day || month === '' || !year) {
        showError('Please fill in all fields.');
        return;
    }
    
    // Validate date
    if (!validateDateCombination()) {
        return;
    }
    
    // Get current date
    const today = new Date();
    const birthDate = new Date(year, month, day);
    
    // Calculate age
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    
    // Handle negative days (borrow from months)
    if (days < 0) {
        months--;
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += lastMonth.getDate();
    }
    
    // Handle negative months (borrow from years)
    if (months < 0) {
        years--;
        months += 12;
    }
    
    // Validate result (should not be negative)
    if (years < 0) {
        showError('Invalid date! Please select a date in the past.');
        return;
    }
    
    // Display result
    displayResult(years, months, days);
    
    // Save to localStorage
    saveLastCalculation(day, month, year);
    
    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display result
function displayResult(years, months, days) {
    hideError();
    
    const yearsText = years === 1 ? 'Year' : 'Years';
    const monthsText = months === 1 ? 'Month' : 'Months';
    const daysText = days === 1 ? 'Day' : 'Days';
    
    resultContent.innerHTML = `
        <span class="result-item result-years">${years} ${yearsText}</span>
        <span class="result-item result-months">${months} ${monthsText}</span>
        <span class="result-item result-days">${days} ${daysText}</span>
    `;
    
    resultSection.style.display = 'block';
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    resultContent.innerHTML = '';
    resultSection.style.display = 'block';
}

// Hide error message
function hideError() {
    errorMessage.style.display = 'none';
}

// Reset calculator
function resetCalculator() {
    daySelect.value = '';
    monthSelect.value = '';
    yearSelect.value = '';
    dateDisplay.textContent = '00/00/0000';
    resultSection.style.display = 'none';
    resultContent.innerHTML = '';
    hideError();
    calculateBtn.disabled = true;
    localStorage.removeItem('lastAgeCalculation');
    
    // Enable all day options
    for (let i = 1; i < daySelect.options.length; i++) {
        daySelect.options[i].disabled = false;
    }
}

// Save last calculation to localStorage
function saveLastCalculation(day, month, year) {
    const calculation = {
        day: day,
        month: month,
        year: year,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('lastAgeCalculation', JSON.stringify(calculation));
}

// Load last calculation from localStorage
function loadLastCalculation() {
    const lastCalculation = localStorage.getItem('lastAgeCalculation');
    if (lastCalculation) {
        try {
            const calculation = JSON.parse(lastCalculation);
            daySelect.value = calculation.day;
            monthSelect.value = calculation.month;
            yearSelect.value = calculation.year;
            updateDateDisplay();
            validateInputs();
        } catch (e) {
            console.error('Error loading last calculation:', e);
        }
    }
}

// Validate day options based on selected month and year
function validateDayForMonth() {
    const month = monthSelect.value;
    const year = yearSelect.value;
    
    if (month !== '' && year) {
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        const daysInMonth = getDaysInMonth(monthNum, yearNum);
        
        // Disable/enable day options based on month
        for (let i = 1; i < daySelect.options.length; i++) {
            const option = daySelect.options[i];
            const dayValue = parseInt(option.value);
            if (dayValue > daysInMonth) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        }
    } else {
        // Enable all day options if month/year not selected
        for (let i = 1; i < daySelect.options.length; i++) {
            daySelect.options[i].disabled = false;
        }
    }
}

