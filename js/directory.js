/**
 * USERHUB - User Directory Script (Lab 8)
 * Handles: Listing all registered users, searching, filtering by gender/country,
 * exporting CSV/JSON, deleting records, and navigating to display.html
 */

document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  UserDirectory.init();
});

const UserDirectory = {
  allUsers: [],
  filteredUsers: [],

  init() {
    this.allUsers = UserStorage.getAllUsers();
    this.filteredUsers = [...this.allUsers];

    this.renderDirectory();
    this.populateCountryFilter();
    this.bindEvents();
    this.updateStats();
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('searchUsersInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterData();
      });
    }

    // Gender filter
    const genderFilter = document.getElementById('genderFilter');
    if (genderFilter) {
      genderFilter.addEventListener('change', () => this.filterData());
    }

    // Country filter
    const countryFilter = document.getElementById('countryFilter');
    if (countryFilter) {
      countryFilter.addEventListener('change', () => this.filterData());
    }

    // Clear filters
    const clearFilterBtn = document.getElementById('clearFiltersBtn');
    if (clearFilterBtn) {
      clearFilterBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (genderFilter) genderFilter.value = 'all';
        if (countryFilter) countryFilter.value = 'all';
        this.filterData();
      });
    }

    // Export CSV
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => this.exportCsv());
    }

    // Clear all records
    const clearAllBtn = document.getElementById('clearAllRecordsBtn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all registered user records?')) {
          localStorage.removeItem(UserStorage.USERS_KEY);
          localStorage.removeItem(UserStorage.CURRENT_USER_KEY);
          sessionStorage.removeItem(UserStorage.CURRENT_USER_KEY);
          this.allUsers = [];
          this.filteredUsers = [];
          this.renderDirectory();
          this.updateStats();
          showToast('Data Cleared', 'All user records have been removed.', 'info');
        }
      });
    }
  },

  populateCountryFilter() {
    const filter = document.getElementById('countryFilter');
    if (!filter) return;

    const countries = [...new Set(this.allUsers.map(u => u.country).filter(Boolean))].sort();
    
    // Retain first "All Countries" option
    filter.innerHTML = '<option value="all">All Countries</option>';
    countries.forEach(country => {
      const opt = document.createElement('option');
      opt.value = country;
      opt.textContent = country;
      filter.appendChild(opt);
    });
  },

  filterData() {
    const search = (document.getElementById('searchUsersInput')?.value || '').toLowerCase().trim();
    const gender = document.getElementById('genderFilter')?.value || 'all';
    const country = document.getElementById('countryFilter')?.value || 'all';

    this.filteredUsers = this.allUsers.filter(u => {
      const matchSearch = !search ||
        (u.name && u.name.toLowerCase().includes(search)) ||
        (u.email && u.email.toLowerCase().includes(search)) ||
        (u.mobile && u.mobile.includes(search)) ||
        (u.city && u.city.toLowerCase().includes(search));

      const matchGender = gender === 'all' || (u.gender && u.gender.toLowerCase() === gender.toLowerCase());
      const matchCountry = country === 'all' || (u.country && u.country.toLowerCase() === country.toLowerCase());

      return matchSearch && matchGender && matchCountry;
    });

    this.renderDirectory();
    this.updateStats();
  },

  renderDirectory() {
    const tbody = document.getElementById('usersTableBody');
    const emptyState = document.getElementById('directoryEmptyState');
    const countDisplay = document.getElementById('recordsCount');

    if (countDisplay) {
      countDisplay.textContent = `${this.filteredUsers.length} of ${this.allUsers.length} record(s)`;
    }

    if (!tbody) return;

    if (this.filteredUsers.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = this.filteredUsers.map(u => {
      // Initials
      const nameParts = (u.name || 'User').trim().split(/\s+/);
      const initials = nameParts.length > 1
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : nameParts[0].substring(0, 2).toUpperCase();

      return `
        <tr>
          <td>
            <div class="user-name-cell">
              <div class="avatar-mini">${initials}</div>
              <div>
                <strong style="color: var(--text-main); font-weight: 700;">${this.escapeHtml(u.name)}</strong>
                <div style="font-size: 0.75rem; color: var(--text-light); font-family: monospace;">${u.id || ''}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="location-chip" style="font-size: 0.75rem;">
              ${this.escapeHtml(u.gender)}
            </span>
          </td>
          <td>
            <a href="mailto:${this.escapeHtml(u.email)}" style="font-weight: 500;">
              ${this.escapeHtml(u.email)}
            </a>
          </td>
          <td>
            <a href="tel:${this.escapeHtml(u.mobile)}" style="color: var(--text-muted); font-family: monospace;">
              ${this.escapeHtml(u.mobile)}
            </a>
          </td>
          <td>
            <div style="font-weight: 600;">${this.escapeHtml(u.city)}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${this.escapeHtml(u.state)}, ${this.escapeHtml(u.country)}</div>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <a href="display.html?id=${u.id}" class="btn btn-secondary btn-sm" title="View details in display page">
              View
            </a>
            <button class="btn btn-ghost btn-sm" style="color: var(--accent-rose);" onclick="UserDirectory.deleteRecord('${u.id}')" title="Delete record">
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  deleteRecord(id) {
    if (confirm('Are you sure you want to delete this user record?')) {
      UserStorage.deleteUser(id);
      this.allUsers = UserStorage.getAllUsers();
      this.filterData();
      showToast('Record Deleted', 'User has been removed from directory.', 'info');
    }
  },

  updateStats() {
    const totalEl = document.getElementById('statTotalDirectory');
    if (totalEl) totalEl.textContent = this.allUsers.length;
  },

  exportCsv() {
    if (this.allUsers.length === 0) {
      showToast('Export Error', 'No records to export.', 'error');
      return;
    }

    const headers = ['ID', 'Name', 'Gender', 'Mobile', 'Email', 'City', 'State', 'Country', 'Created Date'];
    const rows = this.allUsers.map(u => [
      `"${u.id || ''}"`,
      `"${u.name || ''}"`,
      `"${u.gender || ''}"`,
      `"${u.mobile || ''}"`,
      `"${u.email || ''}"`,
      `"${u.city || ''}"`,
      `"${u.state || ''}"`,
      `"${u.country || ''}"`,
      `"${u.createdAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'registered_users_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Export Complete', 'Exported registered records to CSV.', 'success');
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
