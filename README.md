# Lab 8: User Information Capture & Multi-Page JavaScript Display

A modern web application built with Vanilla HTML5, CSS3, and JavaScript to capture user information through an interactive form and transfer/display the captured data across multiple target pages.

---

## 📌 Features & Required Fields Implemented

As per the Lab 8 specifications, the form captures all 7 required attributes:

| # | Field Name | HTML Form Element | Validation & Format |
|---|------------|-------------------|----------------------|
| 1 | **Name** | `<input type="text">` | Required, alphabetic characters & spaces only, min 3 characters |
| 2 | **Gender** | `<input type="radio">` cards | Male, Female, Other/Custom |
| 3 | **Mobile Number** | `<input type="tel">` | 10-digit numeric validation |
| 4 | **Mail ID** | `<input type="email">` | Standard RFC email regular expression |
| 5 | **City** | `<input type="text">` + `<datalist>` | Required, popular city suggestions |
| 6 | **State** | `<input type="text">` | Required, text validation |
| 7 | **Country** | `<select>` dropdown | Required, country selector |

---

## 🚀 How Data is Transferred to Other Pages Using JavaScript

The project demonstrates **Dual-Mechanism Data Transfer**:

1. **URL Query Parameters (`URLSearchParams`)**:
   - On valid form submission in `index.html`, JavaScript constructs an encoded query string:
     ```javascript
     const queryParams = new URLSearchParams({
       id: user.id,
       name: user.name,
       gender: user.gender,
       mobile: user.mobile,
       email: user.email,
       city: user.city,
       state: user.state,
       country: user.country
     });
     window.location.href = `display.html?${queryParams.toString()}`;
     ```
   - In `display.html`, `js/display.js` extracts and decodes each parameter using `new URLSearchParams(window.location.search)`.

2. **Client-Side Storage (`localStorage` & `sessionStorage`)**:
   - Each submission is assigned a unique record ID (e.g., `USR-849201`) and persisted in `localStorage`.
   - Allows viewing individual profiles via `display.html?id=USR-XXXXXX` and accessing all records in the directory (`directory.html`).

---

## 📂 Project Architecture

```
lab-8/
├── index.html          # Form capture page with client-side validation & demo filler
├── display.html        # Profile card presentation page with dynamic avatar & actions
├── directory.html      # Records registry table with search, filters & CSV export
├── css/
│   └── style.css       # Unified design system (CSS variables, Dark/Light mode, print styles)
├── js/
│   ├── app.js          # Core storage layer, form validation, theme manager & toast alerts
│   ├── display.js      # URL param parsing, dynamic profile card rendering & vCard export
│   └── directory.js    # Directory table rendering, search, filtering & record deletion
└── README.md           # Documentation
```

---

## 💡 How to Run & View

1. **Directly in Browser**: Double-click `index.html` to open it in your web browser (Chrome, Edge, Firefox).
2. **Using a Local Server** (Optional):
   ```bash
   python -m http.server 3000
   ```
   Then navigate to `http://localhost:3000/index.html`.

---

## 🌟 Extra Interactive Capabilities
- **Auto-Fill Demo**: Quick 1-click test button to populate valid sample data during lab viva / demonstration.
- **Dark / Light Mode**: Seamless theme toggle persisted in `localStorage`.
- **Export vCard (.vcf)**: Export submitted details directly into contact file format.
- **Export CSV**: Export all stored user entries to a spreadsheet.
- **Print Stylesheet**: Clean, distraction-free layout when printing (`Ctrl + P`).
