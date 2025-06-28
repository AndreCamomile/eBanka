// eBanka JavaScript 

// Telegram Web App initialization
let tg = window.Telegram?.WebApp;

// Initialize Telegram Web App
function initTelegram() {
    if (tg) {
        // Expand the web app to full height
        tg.expand();
        
        // Set main button
        tg.MainButton.text = "Send Data";
        tg.MainButton.show();
        
        // Apply theme colors if available
        if (tg.themeParams) {
            applyTelegramTheme();
        }
        
        // Set up event listeners
        tg.onEvent('mainButtonClicked', function() {
            // Send data back to bot
            tg.sendData(JSON.stringify({
                action: 'search',
                query: document.getElementById('searchInput').value
            }));
        });
        
        tg.onEvent('backButtonClicked', function() {
            tg.close();
        });
        
        console.log('Telegram Web App initialized');
        console.log('User:', tg.initDataUnsafe?.user);
    } else {
        console.log('Not running in Telegram Web App');
    }
}

// Apply Telegram theme colors
function applyTelegramTheme() {
    if (!tg?.themeParams) return;
    
    const root = document.documentElement;
    const theme = tg.themeParams;
    
    if (theme.bg_color) {
        root.style.setProperty('--tg-bg-color', theme.bg_color);
        document.body.style.backgroundColor = theme.bg_color;
    }
    
    if (theme.text_color) {
        root.style.setProperty('--tg-text-color', theme.text_color);
    }
    
    if (theme.button_color) {
        root.style.setProperty('--tg-button-color', theme.button_color);
    }
    
    if (theme.button_text_color) {
        root.style.setProperty('--tg-button-text-color', theme.button_text_color);
    }
}

// Get user info from Telegram
function getTelegramUser() {
    if (tg?.initDataUnsafe?.user) {
        return {
            id: tg.initDataUnsafe.user.id,
            firstName: tg.initDataUnsafe.user.first_name,
            lastName: tg.initDataUnsafe.user.last_name,
            username: tg.initDataUnsafe.user.username,
            languageCode: tg.initDataUnsafe.user.language_code
        };
    }
    return null;
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Telegram first
    initTelegram();
    
    const searchInput = document.getElementById('searchInput');
    const textMeasurer = document.getElementById('textMeasurer');
    const searchBox = document.querySelector('.search-box');
    const avatarCircle = document.getElementById('avatarCircle');
    const dropdownMenu = document.getElementById('dropdownMenu');

    // Set user info if available
    const telegramUser = getTelegramUser();
    if (telegramUser) {
        console.log('Telegram User:', telegramUser);
        
        // You can use the user info to personalize the experience
        if (telegramUser.username) {
            searchInput.placeholder = telegramUser.username;
        }
    }

    // Function to validate nickname length
    function validateNickname(nickname) {
        return nickname.length >= 5 && nickname.length <= 32;
    }

    // Function to measure text width and adjust input width
    function adjustInputWidth() {
        const currentText = searchInput.value || searchInput.placeholder;
        textMeasurer.textContent = currentText;
        
        // Get the width of the text
        const textWidth = textMeasurer.getBoundingClientRect().width;
        
        // Add some padding (20px) to the text width
        const newWidth = Math.max(80, textWidth + 20);
        
        // Apply the new width
        searchInput.style.width = newWidth + 'px';
    }

    // Function to update validation styles
    function updateValidationStyles() {
        const nickname = searchInput.value;
        const isValid = nickname.length === 0 || validateNickname(nickname);
        
        if (isValid) {
            searchBox.classList.remove('invalid');
            searchInput.classList.remove('invalid');
        } else {
            searchBox.classList.add('invalid');
            searchInput.classList.add('invalid');
        }
        
        // Update Telegram main button state
        if (tg && tg.MainButton) {
            if (nickname && isValid) {
                tg.MainButton.enable();
            } else {
                tg.MainButton.disable();
            }
        }
    }

    // Avatar dropdown functionality
    function toggleDropdown() {
        const isOpen = dropdownMenu.classList.contains('show');
        
        if (isOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    }

    function openDropdown() {
        dropdownMenu.classList.add('show');
        avatarCircle.classList.add('active');
    }

    function closeDropdown() {
        dropdownMenu.classList.remove('show');
        avatarCircle.classList.remove('active');
    }

    // Avatar click handler
    avatarCircle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown();
    });

    // Menu item click handlers
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            
            switch(action) {
                case 'donate':
                    window.location.href = 'donate.html';
                    break;
                case 'dashboard':
                    window.location.href = 'dashboard.html';
                    break;
                case 'settings':
                    window.location.href = 'settings.html';
                    break;
            }
            
            closeDropdown();
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.avatar-container')) {
            closeDropdown();
        }
    });

    // Close dropdown with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeDropdown();
        }
    });

    // Prevent typing more than 32 characters
    searchInput.addEventListener('input', function(e) {
        // Limit to 32 characters
        if (this.value.length > 32) {
            this.value = this.value.substring(0, 32);
        }
        
        adjustInputWidth();
        updateValidationStyles();
    });

    // Initial width adjustment
    adjustInputWidth();

    // Adjust width when placeholder is shown/hidden
    searchInput.addEventListener('focus', function() {
        if (!this.value) {
            adjustInputWidth();
        }
    });

    searchInput.addEventListener('blur', function() {
        if (!this.value) {
            adjustInputWidth();
        }
        updateValidationStyles();
    });

    // Enter key handler in search field
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            const searchValue = this.value;
            
            if (validateNickname(searchValue)) {
                console.log('Search:', searchValue);
                
                // Send data to Telegram bot if available
                if (tg) {
                    tg.sendData(JSON.stringify({
                        action: 'search',
                        query: searchValue,
                        user: getTelegramUser()
                    }));
                } else {
                    alert(`Searching for: "@${searchValue}"`);
                }
            } else {
                // Show alert via Telegram or browser
                if (tg) {
                    tg.showAlert('Nickname must be between 5 and 32 characters long!');
                } else {
                    alert('Nickname must be between 5 and 32 characters long!');
                }
            }
        }
    });
}); 