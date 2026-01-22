const FIXED_RATE = 1.95583;
let currentDirection = 'euroToLev'; // 'euroToLev' или 'levToEuro'

// Получаване на browser API (работи и за Chrome, и за Firefox)
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Инициализация при зареждане
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Референции към DOM елементи
    const euroInput = document.getElementById('euroInput');
    const levInput = document.getElementById('levInput');
    const resultDisplay = document.getElementById('resultDisplay');
    const euroBox = document.getElementById('euroBox');
    const levBox = document.getElementById('levBox');
    const swapBtn = document.getElementById('swapBtn');
    const copyBtn = document.getElementById('copyBtn');
    
    // Зареждане на запазеното състояние
    loadState(euroInput, levInput, resultDisplay, euroBox, levBox);
    
    // Event listeners
    setupEventListeners(euroInput, levInput, resultDisplay, euroBox, levBox, swapBtn, copyBtn);
}

function setupEventListeners(euroInput, levInput, resultDisplay, euroBox, levBox, swapBtn, copyBtn) {
    // Събитие за горното поле
    euroInput.addEventListener('input', function() {
        handleInput(this.value, 'top', euroInput, levInput, resultDisplay, euroBox, levBox);
    });
    
    // Събитие за долното поле
    levInput.addEventListener('input', function() {
        handleInput(this.value, 'bottom', euroInput, levInput, resultDisplay, euroBox, levBox);
    });
    
    // Бутон за размяна
    swapBtn.addEventListener('click', function() {
        swapValues(euroInput, levInput, resultDisplay, euroBox, levBox, swapBtn);
    });
    
    // Бутон за копиране
    copyBtn.addEventListener('click', function() {
        copyToClipboard(levInput, copyBtn);
    });
    
    console.log('Listeners attached');
}

function handleInput(value, source, euroInput, levInput, resultDisplay, euroBox, levBox) {
    const numValue = parseFloat(value) || 0;
    
    if (currentDirection === 'euroToLev') {
        if (source === 'top') {
            // Евро -> Лев
            const leva = numValue * FIXED_RATE;
            levInput.value = leva.toFixed(2);
            updateResult(numValue, leva, 'EUR', 'BGN', resultDisplay);
        } else {
            // Лев -> Евро (обратна конверсия)
            const euros = numValue / FIXED_RATE;
            euroInput.value = euros.toFixed(2);
            updateResult(euros, numValue, 'EUR', 'BGN', resultDisplay);
        }
    } else {
        if (source === 'top') {
            // Лев -> Евро
            const euros = numValue / FIXED_RATE;
            levInput.value = euros.toFixed(2);
            updateResult(numValue, euros, 'BGN', 'EUR', resultDisplay);
        } else {
            // Евро -> Лев (обратна конверсия)
            const leva = numValue * FIXED_RATE;
            euroInput.value = leva.toFixed(2);
            updateResult(leva, numValue, 'BGN', 'EUR', resultDisplay);
        }
    }
    
    saveState(euroInput, levInput, euroBox, levBox);
}

function updateResult(from, to, fromCurrency, toCurrency, resultDisplay) {
    if (from === 0) {
        resultDisplay.textContent = '0.00';
    } else {
        resultDisplay.textContent = `${from.toFixed(2)} ${fromCurrency} = ${to.toFixed(2)} ${toCurrency}`;
    }
}

function swapValues(euroInput, levInput, resultDisplay, euroBox, levBox, swapBtn) {
    // Добавяне на анимации - със забавяне за да синхронизираме
    swapBtn.classList.add('rotating');
    
    // Визуално разменяме полетата с анимации
    euroBox.classList.add('rotating-down');
    levBox.classList.add('rotating-up');
    
    // Запазване на текущите стойности ПРЕДИ размяната
    const currentTopValue = euroInput.value;
    const currentBottomValue = levInput.value;
    
    // Промяна на посоката
    currentDirection = currentDirection === 'euroToLev' ? 'levToEuro' : 'euroToLev';
    
    // Смяна на етикетите
    const topLabel = euroBox.querySelector('label');
    const bottomLabel = levBox.querySelector('label');
    const topCurrency = euroBox.querySelector('.currency');
    const bottomCurrency = levBox.querySelector('.currency');
    
    if (currentDirection === 'levToEuro') {
        // Сега BGN ще е горе, EUR долу
        topLabel.textContent = 'Лева (BGN)';
        topCurrency.textContent = 'BGN';
        bottomLabel.textContent = 'Евро (EUR)';
        bottomCurrency.textContent = 'EUR';
        
        // Смяна на стойностите - дъното става горе
        euroInput.value = currentBottomValue;
        
        // Преизчисляване на долната стойност
        if (currentBottomValue && parseFloat(currentBottomValue) > 0) {
            const leva = parseFloat(currentBottomValue);
            const euros = leva / FIXED_RATE;
            levInput.value = euros.toFixed(2);
            updateResult(leva, euros, 'BGN', 'EUR', resultDisplay);
        } else {
            levInput.value = '0.00';
            updateResult(0, 0, 'BGN', 'EUR', resultDisplay);
        }
    } else {
        // Сега EUR ще е горе, BGN долу
        topLabel.textContent = 'Евро (EUR)';
        topCurrency.textContent = 'EUR';
        bottomLabel.textContent = 'Лева (BGN)';
        bottomCurrency.textContent = 'BGN';
        
        // Смяна на стойностите - дъното става горе
        euroInput.value = currentBottomValue;
        
        // Преизчисляване на долната стойност
        if (currentBottomValue && parseFloat(currentBottomValue) > 0) {
            const euros = parseFloat(currentBottomValue);
            const leva = euros * FIXED_RATE;
            levInput.value = leva.toFixed(2);
            updateResult(euros, leva, 'EUR', 'BGN', resultDisplay);
        } else {
            levInput.value = '0.00';
            updateResult(0, 0, 'EUR', 'BGN', resultDisplay);
        }
    }
    
    // Премахване на анимации след време
    setTimeout(() => {
        swapBtn.classList.remove('rotating');
        euroBox.classList.remove('rotating-down');
        levBox.classList.remove('rotating-up');
    }, 600);
    
    // Запазване на състоянието
    saveState(euroInput, levInput, euroBox, levBox);
    
    console.log('Swapped to:', currentDirection);
}

function copyToClipboard(levInput, copyBtn) {
    const convertedValue = levInput.value;
    
    if (!convertedValue || convertedValue === '0.00' || convertedValue === '0') {
        return;
    }
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(convertedValue).then(() => {
            showCopyFeedback(true, copyBtn);
        }).catch(err => {
            fallbackCopy(convertedValue, copyBtn);
        });
    } else {
        fallbackCopy(convertedValue, copyBtn);
    }
}

function fallbackCopy(text, copyBtn) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showCopyFeedback(true, copyBtn);
    } catch (err) {
        console.error('Грешка при копиране:', err);
        showCopyFeedback(false, copyBtn);
    }
    
    document.body.removeChild(textarea);
}

function showCopyFeedback(success, copyBtn) {
    const originalText = copyBtn.textContent;
    
    if (success) {
        copyBtn.textContent = 'Копирано';
        copyBtn.classList.add('copied');
    } else {
        copyBtn.textContent = 'Грешка';
    }
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove('copied');
    }, 2000);
}

function saveState(euroInput, levInput, euroBox, levBox) {
    const topLabel = euroBox.querySelector('label').textContent;
    const state = {
        direction: currentDirection,
        topValue: euroInput.value,
        bottomValue: levInput.value,
        isEuroTop: topLabel.includes('EUR')
    };
    
    browserAPI.storage.local.set({ converterState: state });
    console.log('State saved:', state);
}

function loadState(euroInput, levInput, resultDisplay, euroBox, levBox) {
    browserAPI.storage.local.get(['converterState'], function(result) {
        if (result.converterState) {
            const state = result.converterState;
            console.log('Loading state:', state);
            
            // Възстановяване на посоката
            currentDirection = state.direction || 'euroToLev';
            
            // Възстановяване на етикетите
            const topLabel = euroBox.querySelector('label');
            const bottomLabel = levBox.querySelector('label');
            const topCurrency = euroBox.querySelector('.currency');
            const bottomCurrency = levBox.querySelector('.currency');
            
            if (currentDirection === 'levToEuro') {
                topLabel.textContent = 'Лева (BGN)';
                topCurrency.textContent = 'BGN';
                bottomLabel.textContent = 'Евро (EUR)';
                bottomCurrency.textContent = 'EUR';
            } else {
                topLabel.textContent = 'Евро (EUR)';
                topCurrency.textContent = 'EUR';
                bottomLabel.textContent = 'Лева (BGN)';
                bottomCurrency.textContent = 'BGN';
            }
            
            // Възстановяване на стойностите
            if (state.topValue) euroInput.value = state.topValue;
            if (state.bottomValue) levInput.value = state.bottomValue;
            
            // Възстановяване на резултата
            if (state.topValue && parseFloat(state.topValue) > 0) {
                const topVal = parseFloat(state.topValue);
                const bottomVal = parseFloat(state.bottomValue) || 0;
                
                if (currentDirection === 'euroToLev') {
                    updateResult(topVal, bottomVal, 'EUR', 'BGN', resultDisplay);
                } else {
                    updateResult(topVal, bottomVal, 'BGN', 'EUR', resultDisplay);
                }
            } else {
                resultDisplay.textContent = '0.00';
            }
        } else {
            console.log('No saved state found');
            // По подразбиране: EUR горе, BGN долу
            currentDirection = 'euroToLev';
            resultDisplay.textContent = '0.00';
        }
    });
}