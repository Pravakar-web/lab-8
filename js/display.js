/**
 * USERHUB - Profile Display Script (Lab 8)
 * Handles: Reading data from URL query params or LocalStorage,
 * dynamic avatar rendering, clipboard copies, vCard export, and printing.
 */

document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  ProfileDisplay.init();
});

const ProfileDisplay = {
  currentUser: null,

  init() {
    this.currentUser = this.resolveUserData();

    if (!this.currentUser) {
      this.renderEmptyState();
      return;
    }

    this.renderProfile(this.currentUser);
    this.bindActions();
  },

  // Resolve user data using DUAL data transfer:
  // 1. First priority: Check URL Query Parameters (URLSearchParams)
  // 2. Second priority: If ID provided, fetch from UserStorage.getUserById(id)
  // 3. Fallback: UserStorage.getCurrentUser()
  resolveUserData() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    // If full data is passed via URL parameters
    if (params.get('name') && params.get('email')) {
      return {
        id: id || 'USR-' + Math.floor(100000 + Math.random() * 900000),
        name: params.get('name'),
        gender: params.get('gender') || 'Not Specified',
        mobile: params.get('mobile') || 'N/A',
        email: params.get('email'),
        city: params.get('city') || '',
        state: params.get('state') || '',
        country: params.get('country') || '',
        formattedDate: 'Just now'
      };
    }

    // If ID is passed via URL, lookup in storage
    if (id) {
      const stored = UserStorage.getUserById(id);
      if (stored) return stored;
    }

    // Otherwise load latest active user from storage
    return UserStorage.getCurrentUser();
  },

  renderProfile(user) {
    const cardEl = document.getElementById('profileCardContainer');
    if (!cardEl) return;

    // Calculate initials
    const nameParts = (user.name || 'User').trim().split(/\s+/);
    const initials = nameParts.length > 1
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : nameParts[0].substring(0, 2).toUpperCase();

    // Gender specific icon and badge
    const genderKey = (user.gender || '').toLowerCase();
    let genderSymbol = '⚧';
    let genderClass = 'other';
    if (genderKey === 'male') {
      genderSymbol = '♂';
      genderClass = 'male';
    } else if (genderKey === 'female') {
      genderSymbol = '♀';
      genderClass = 'female';
    }

    // Set dynamic page title
    document.title = `${user.name} - Profile Details | UserHub`;

    cardEl.innerHTML = `
      <div class="profile-card">
        <!-- Card Header Banner -->
        <div class="profile-card-header">
          <div class="profile-badge-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span>Verified Record &bull; ${user.id || 'MEMBER'}</span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="profile-card-body">
          <!-- Avatar with Gender Badge -->
          <div class="avatar-wrapper">
            <div class="profile-avatar">${initials}</div>
            <div class="gender-indicator-icon ${genderClass}" title="Gender: ${user.gender}">
              ${genderSymbol}
            </div>
          </div>

          <!-- Headline -->
          <div class="profile-headline">
            <div>
              <h1 class="profile-name" id="displayUserName">${this.escapeHtml(user.name)}</h1>
              <div class="profile-meta-sub">
                <span>Submitted: ${user.formattedDate || 'Recently'}</span>
                <span>&bull;</span>
                <span class="verified-pill">Active Profile</span>
              </div>
            </div>
            <div>
              <button id="copySummaryBtn" class="btn btn-secondary btn-sm" title="Copy profile summary to clipboard">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copy Details
              </button>
            </div>
          </div>

          <!-- Info Details Grid -->
          <div class="info-display-grid">
            <!-- Mail ID Card -->
            <div class="info-item-card">
              <div class="info-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div class="info-card-content">
                <div class="info-card-label">Email ID</div>
                <div class="info-card-value">
                  <a href="mailto:${this.escapeHtml(user.email)}" title="Send Email">${this.escapeHtml(user.email)}</a>
                </div>
              </div>
              <button class="copy-btn" onclick="ProfileDisplay.copyText('${this.escapeHtml(user.email)}', 'Email ID')" title="Copy Email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>

            <!-- Mobile Number Card -->
            <div class="info-item-card">
              <div class="info-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div class="info-card-content">
                <div class="info-card-label">Mobile Number</div>
                <div class="info-card-value">
                  <a href="tel:${this.escapeHtml(user.mobile)}" title="Call Mobile">${this.escapeHtml(user.mobile)}</a>
                </div>
              </div>
              <button class="copy-btn" onclick="ProfileDisplay.copyText('${this.escapeHtml(user.mobile)}', 'Mobile Number')" title="Copy Mobile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>

            <!-- Gender Card -->
            <div class="info-item-card">
              <div class="info-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"></circle><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"></path></svg>
              </div>
              <div class="info-card-content">
                <div class="info-card-label">Gender</div>
                <div class="info-card-value">${this.escapeHtml(user.gender)}</div>
              </div>
            </div>

            <!-- Member ID Card -->
            <div class="info-item-card">
              <div class="info-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div class="info-card-content">
                <div class="info-card-label">Registration ID</div>
                <div class="info-card-value" style="font-family: monospace; letter-spacing: 0.05em;">${this.escapeHtml(user.id || 'N/A')}</div>
              </div>
            </div>
          </div>

          <!-- Highlight Location Bar (City, State, Country) -->
          <div class="location-highlight-card">
            <div class="location-icon-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div class="location-details-box">
              <div class="location-label">Geographic Location</div>
              <div class="location-full-text">
                ${this.escapeHtml(user.city)}, ${this.escapeHtml(user.state)}, ${this.escapeHtml(user.country)}
              </div>
              <div class="location-chips">
                <span class="location-chip">City: <strong>${this.escapeHtml(user.city)}</strong></span>
                <span class="location-chip">State: <strong>${this.escapeHtml(user.state)}</strong></span>
                <span class="location-chip">Country: <strong>${this.escapeHtml(user.country)}</strong></span>
              </div>
            </div>
          </div>

          <!-- Profile Action Buttons -->
          <div class="profile-actions">
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <a href="index.html" class="btn btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Register Another User
              </a>
              <a href="directory.html" class="btn btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                View All Records
              </a>
            </div>

            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <button id="downloadVCardBtn" class="btn btn-secondary" title="Export as vCard (.vcf) contact file">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Export vCard
              </button>
              <button id="printProfileBtn" class="btn btn-primary" title="Print this profile record">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Print Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderEmptyState() {
    const cardEl = document.getElementById('profileCardContainer');
    if (!cardEl) return;

    cardEl.innerHTML = `
      <div class="card empty-state">
        <div class="empty-state-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h2 class="empty-state-title">No User Data Found</h2>
        <p class="empty-state-text">
          No profile parameters were passed and no previous registrations were found in storage. Please submit your information using the registration form.
        </p>
        <a href="index.html" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Go to Registration Form
        </a>
      </div>
    `;
  },

  bindActions() {
    // Print Profile
    const printBtn = document.getElementById('printProfileBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Export vCard (.vcf)
    const vCardBtn = document.getElementById('downloadVCardBtn');
    if (vCardBtn) {
      vCardBtn.addEventListener('click', () => {
        this.downloadVCard(this.currentUser);
      });
    }

    // Copy Summary
    const copySummaryBtn = document.getElementById('copySummaryBtn');
    if (copySummaryBtn) {
      copySummaryBtn.addEventListener('click', () => {
        const u = this.currentUser;
        const text = `User Profile Details:
• Name: ${u.name}
• Gender: ${u.gender}
• Mobile: ${u.mobile}
• Email: ${u.email}
• City: ${u.city}
• State: ${u.state}
• Country: ${u.country}
• Registration ID: ${u.id || 'N/A'}`;
        this.copyText(text, 'Complete profile summary');
      });
    }
  },

  copyText(text, label) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to Clipboard!', `${label} has been copied.`, 'success');
      }).catch(() => {
        this.fallbackCopyText(text, label);
      });
    } else {
      this.fallbackCopyText(text, label);
    }
  },

  fallbackCopyText(text, label) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Copied!', `${label} copied.`, 'success');
    } catch (err) {
      showToast('Copy Failed', 'Unable to access clipboard.', 'error');
    }
    document.body.removeChild(textArea);
  },

  downloadVCard(user) {
    const vcardContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${user.name}`,
      `TEL;TYPE=CELL:${user.mobile}`,
      `EMAIL:${user.email}`,
      `ADR;TYPE=HOME:;;;${user.city};${user.state};;${user.country}`,
      `NOTE:Gender: ${user.gender} | ID: ${user.id || ''}`,
      'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user.name.replace(/\s+/g, '_')}_contact.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('vCard Exported', `Saved contact file for ${user.name}`, 'success');
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
