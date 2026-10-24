/**
 * USERHUB - Core Application Logic & Storage Manager (Lab 8)
 * Handles: LocalStorage management, Dual Data Transfer (URL params + Storage),
 * Form validation, Theme switching, and Toast notifications.
 */

// ==========================================
// 1. DATA STORAGE LAYER
// ==========================================
const UserStorage = {
  USERS_KEY: 'lab8_registered_users',
  CURRENT_USER_KEY: 'lab8_active_user',

  // Save a new user submission
  saveUser(userData) {
    const users = this.getAllUsers();
    
    // Create complete record with metadata
    const userRecord = {
      id: 'USR-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      formattedDate: new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date()),
      ...userData
    };

    // Prepend new user
    users.unshift(userRecord);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    // Store as currently active user
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userRecord));

    // Also store in sessionStorage for isolated session reference
    sessionStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userRecord));

    return userRecord;
  },

  // Get all registered users
  getAllUsers() {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading users from localStorage:', e);
      return [];
    }
  },

  // Get currently active or latest user
  getCurrentUser() {
    try {
      // First check sessionStorage, then localStorage
      const sessionData = sessionStorage.getItem(this.CURRENT_USER_KEY);
      if (sessionData) return JSON.parse(sessionData);

      const localData = localStorage.getItem(this.CURRENT_USER_KEY);
      if (localData) return JSON.parse(localData);

      // Fallback: return the first user in the list
      const users = this.getAllUsers();
      return users.length > 0 ? users[0] : null;
    } catch (e) {
      console.error('Error getting current user:', e);
      return null;
    }
  },

  // Find user by ID
  getUserById(id) {
    const users = this.getAllUsers();
    return users.find(u => u.id === id) || null;
  },

  // Delete a user
  deleteUser(id) {
    let users = this.getAllUsers();
    users = users.filter(u => u.id !== id);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    // If active user is deleted, clear active user
    const current = this.getCurrentUser();
    if (current && current.id === id) {
      localStorage.removeItem(this.CURRENT_USER_KEY);
      sessionStorage.removeItem(this.CURRENT_USER_KEY);
    }
    return true;
  },

  // Seed sample data if storage is completely empty
  seedInitialDataIfEmpty() {
    if (this.getAllUsers().length === 0) {
      const demoUsers = [
        {
          id: 'USR-849201',
          name: 'Priya Sharma',
          gender: 'Female',
          mobile: '9876543210',
          email: 'priya.sharma@example.com',
          city: 'Bengaluru',
          state: 'Karnataka',
          country: 'India',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          formattedDate: 'Yesterday at 4:30 PM'
        },
        {
          id: 'USR-512943',
          name: 'Alex Morgan',
          gender: 'Male',
          mobile: '9845012345',
          email: 'alex.morgan@techmail.org',
          city: 'San Francisco',
          state: 'California',
          country: 'United States',
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          formattedDate: '2 days ago'
        }
      ];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(demoUsers));
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(demoUsers[0]));
    }
  }
};

// ==========================================
// 2. THEME MANAGER (DARK / LIGHT MODE)
// ==========================================
const ThemeManager = {
  THEME_KEY: 'lab8_color_theme',

  init() {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    this.setTheme(initialTheme);

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(nextTheme);
      });
    }
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
    
    const iconContainer = document.getElementById('themeIcon');
    if (iconContainer) {
      iconContainer.innerHTML = theme === 'dark'
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
  }
};

// ==========================================
// 3. TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(title, message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || '•'}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove after 3.5s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// 4. FORM VALIDATION & CONTROLLER (index.html)
// ==========================================
const RegistrationForm = {
  form: null,

  init() {
    this.form = document.getElementById('userRegistrationForm');
    if (!this.form) return;

    this.bindEvents();
    this.updateCounters();
  },

  bindEvents() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Real-time input validation & error cleanup
    const inputs = this.form.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('input', () => this.clearError(input.name));
      input.addEventListener('change', () => this.clearError(input.name));
    });

    // Demo Data Button
    const demoBtn = document.getElementById('fillDemoBtn');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => this.fillDemoData());
    }

    // Reset button
    const resetBtn = document.getElementById('resetFormBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.clearAllErrors();
        showToast('Form Reset', 'All input fields cleared', 'info');
      });
    }
  },

  // Validate all fields
  validate() {
    let isValid = true;
    this.clearAllErrors();

    // 1. Name validation
    const nameInput = document.getElementById('userName');
    const nameVal = nameInput ? nameInput.value.trim() : '';
    if (!nameVal) {
      this.showError('name', 'Full name is required.');
      isValid = false;
    } else if (nameVal.length < 3) {
      this.showError('name', 'Name must be at least 3 characters.');
      isValid = false;
    } else if (!/^[a-zA-Z\s.'-]+$/.test(nameVal)) {
      this.showError('name', 'Name must contain only alphabets and spaces.');
      isValid = false;
    }

    // 2. Gender validation
    const genderChecked = this.form.querySelector('input[name="gender"]:checked');
    if (!genderChecked) {
      this.showError('gender', 'Please select a gender.');
      isValid = false;
    }

    // 3. Mobile Number validation
    const mobileInput = document.getElementById('userMobile');
    const mobileVal = mobileInput ? mobileInput.value.trim() : '';
    // Accepts 10 digits, optional spaces or dashes
    const cleanMobile = mobileVal.replace(/[\s-]/g, '');
    if (!mobileVal) {
      this.showError('mobile', 'Mobile number is required.');
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(cleanMobile)) {
      this.showError('mobile', 'Please enter a valid 10-digit mobile number.');
      isValid = false;
    }

    // 4. Email ID validation
    const emailInput = document.getElementById('userEmail');
    const emailVal = emailInput ? emailInput.value.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      this.showError('email', 'Email ID is required.');
      isValid = false;
    } else if (!emailRegex.test(emailVal)) {
      this.showError('email', 'Please enter a valid email address (e.g. name@domain.com).');
      isValid = false;
    }

    // 5. City validation
    const cityInput = document.getElementById('userCity');
    const cityVal = cityInput ? cityInput.value.trim() : '';
    if (!cityVal) {
      this.showError('city', 'City name is required.');
      isValid = false;
    } else if (cityVal.length < 2) {
      this.showError('city', 'Please enter a valid city name.');
      isValid = false;
    }

    // 6. State validation
    const stateInput = document.getElementById('userState');
    const stateVal = stateInput ? stateInput.value.trim() : '';
    if (!stateVal) {
      this.showError('state', 'State / Province is required.');
      isValid = false;
    }

    // 7. Country validation
    const countryInput = document.getElementById('userCountry');
    const countryVal = countryInput ? countryInput.value.trim() : '';
    if (!countryVal) {
      this.showError('country', 'Please select or enter your country.');
      isValid = false;
    }

    return isValid;
  },

  showError(fieldName, message) {
    const group = document.querySelector(`[data-field="${fieldName}"]`);
    if (group) {
      group.classList.add('has-error');
      const errEl = group.querySelector('.error-message');
      if (errEl) {
        errEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> ${message}`;
      }
    }
  },

  clearError(fieldName) {
    const group = document.querySelector(`[data-field="${fieldName}"]`);
    if (group) {
      group.classList.remove('has-error');
      const errEl = group.querySelector('.error-message');
      if (errEl) errEl.textContent = '';
    }
  },

  clearAllErrors() {
    const errorGroups = document.querySelectorAll('.has-error');
    errorGroups.forEach(g => g.classList.remove('has-error'));
  },

  handleSubmit(e) {
    e.preventDefault();

    if (!this.validate()) {
      showToast('Validation Error', 'Please check the highlighted fields.', 'error');
      // Scroll to first error
      const firstError = document.querySelector('.has-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Extract values
    const formData = {
      name: document.getElementById('userName').value.trim(),
      gender: this.form.querySelector('input[name="gender"]:checked').value,
      mobile: document.getElementById('userMobile').value.trim(),
      email: document.getElementById('userEmail').value.trim(),
      city: document.getElementById('userCity').value.trim(),
      state: document.getElementById('userState').value.trim(),
      country: document.getElementById('userCountry').value.trim()
    };

    // Save record to local/session storage
    const savedUser = UserStorage.saveUser(formData);

    // Provide visual feedback
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Saving & Redirecting...</span>`;
    }

    showToast('Success!', 'User information captured successfully. Redirecting...', 'success');

    // Dual-mechanism transfer:
    // Pass user ID + encoded query parameters to display.html
    const queryParams = new URLSearchParams({
      id: savedUser.id,
      name: savedUser.name,
      gender: savedUser.gender,
      mobile: savedUser.mobile,
      email: savedUser.email,
      city: savedUser.city,
      state: savedUser.state,
      country: savedUser.country
    });

    setTimeout(() => {
      window.location.href = `display.html?${queryParams.toString()}`;
    }, 800);
  },

  // Populate form with random sample data for quick evaluation
  fillDemoData() {
    const samples = [
      {
        name: 'Aarav Patel',
        gender: 'Male',
        mobile: '9823456789',
        email: 'aarav.patel@workmail.com',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      },
      {
        name: 'Ananya Iyer',
        gender: 'Female',
        mobile: '9741234567',
        email: 'ananya.iyer@designhub.io',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India'
      },
      {
        name: 'Jordan Rivera',
        gender: 'Other',
        mobile: '9123456780',
        email: 'jordan.rivera@globalnet.co',
        city: 'Seattle',
        state: 'Washington',
        country: 'United States'
      }
    ];

    const pick = samples[Math.floor(Math.random() * samples.length)];

    document.getElementById('userName').value = pick.name;
    const genderRadio = this.form.querySelector(`input[name="gender"][value="${pick.gender}"]`);
    if (genderRadio) genderRadio.checked = true;
    document.getElementById('userMobile').value = pick.mobile;
    document.getElementById('userEmail').value = pick.email;
    document.getElementById('userCity').value = pick.city;
    document.getElementById('userState').value = pick.state;
    document.getElementById('userCountry').value = pick.country;

    this.clearAllErrors();
    showToast('Demo Data Filled', `Loaded profile details for ${pick.name}`, 'info');
  },

  updateCounters() {
    const totalUsersEl = document.getElementById('statTotalUsers');
    if (totalUsersEl) {
      totalUsersEl.textContent = UserStorage.getAllUsers().length;
    }
  }
};

// Auto initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  UserStorage.seedInitialDataIfEmpty();
  ThemeManager.init();
  RegistrationForm.init();
});
