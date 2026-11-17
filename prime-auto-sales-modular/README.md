# Prime Auto Sales — Modular Website

This is **one Visual Studio Code project** containing four independent modules. Each module has its own `index.html` and JavaScript file, and all modules use the same browser storage through `js/common.js`.

## Project structure

```text
prime-auto-sales-modular/
├── index.html                         # Main dashboard
├── css/
│   └── styles.css                     # Shared design
├── js/
│   └── common.js                      # Shared storage and helpers
└── modules/
    ├── customer-management/
    │   ├── index.html
    │   └── customer-management.js
    ├── vehicle-management/
    │   ├── index.html
    │   └── vehicle-management.js
    ├── sales/
    │   ├── index.html
    │   └── sales.js
    └── customer-service/
        ├── index.html
        └── customer-service.js
```

## Run in Visual Studio Code

1. Extract the ZIP file.
2. In Visual Studio Code, choose **File → Open Folder** and open `prime-auto-sales-modular`.
3. Open `index.html` in a browser. A simple local server or the VS Code Live Server extension is recommended for consistent local testing.
4. Use the dashboard links to open each module.

No Node.js, React, package installation or external library is required. This project uses HTML, CSS and vanilla JavaScript only.

## Login

The project now opens with a login screen. Demo credentials:
- Username: `admin`
- Password: `Prime123!`

Use the Log out button in the sidebar to end the local session. This is a front-end demonstration only: credentials and session state are handled in browser JavaScript/localStorage, so this is not secure authentication for a real business. A production version needs a server-side login and database.

## Included functionality

All four modules support Add, Edit, Delete, List, Find/Search and field validation. Status/category dropdowns provide filtering in each module. The dashboard and modules require the demo login.

## What each module does

### 1. Customer Management
- Add, edit, delete and search customer records.
- Fields: CustomerID, Name, Phone, Email and Address.
- Export customer records to CSV.

### 2. Vehicle Management
- Add, edit, delete and search vehicle records.
- Fields: VehicleID, Make, Model, Year, Mileage, Price and Status (Available/Pending/Sold).
- Prevent deleting a vehicle already linked to a sale.
- Export vehicle records to CSV.

### 3. Sales
- Create, edit, search and delete sales.
- Select existing customers and vehicles from the other modules.
- Fields: SaleID, CustomerID, VehicleID, SaleDate, SalePrice and PaymentStatus.
- Update vehicle availability when a sale is recorded or removed.
- Export sales to CSV.

### 4. Customer Service
- Create, edit, search and delete customer enquiries.
- Fields: EnquiryId, CustomerID, VehicleID, EnquiryDate, Message and Status.
- Add test-drive bookings and update their status.
- Export enquiries to CSV.

## Data storage note

The demo uses `localStorage` in the browser. All four modules read and update the same records when opened from the same browser and local origin. This is not a production database or a multi-user system. For a deployed multi-user application, connect the modules to a server-side database and add authentication/authorization.

## Reset demo data

To clear the records, open the browser developer console on this site and run:

```js
Object.keys(localStorage).filter(k => k.startsWith('prime_')).forEach(k => localStorage.removeItem(k));
location.reload();
```


## Login and sign-up
- Use the **Sign up** link on the login screen to create a local demo account.
- Registration checks name, username format, email, password length, matching passwords, and duplicate username/email.
- After registration, return to Log in and sign in with the new account.
- The demo administrator account remains `admin` / `Prime123!`.
- Accounts are stored in this browser's localStorage. This is only a classroom/demo authentication flow; do not use real passwords or treat it as secure production authentication.


## SQLite database setup (Visual Studio Code)

The four existing modules are preserved. Their existing JavaScript files still call the same `Store` methods; the shared `js/common.js` now sends those requests to a local SQLite database through the Node.js server. Customer, vehicle, sales, enquiry and test-drive booking records are stored in `prime-auto-sales.db` in this project folder. The database file is created automatically the first time the server starts.

### Run the project

1. Install [Node.js](https://nodejs.org/) if it is not already installed.
2. Open the `prime-auto-sales-modular` folder in Visual Studio Code.
3. Open **Terminal → New Terminal**.
4. Run `npm install` and wait for it to finish.
5. Run `npm start`.
6. Open `http://localhost:3000` in your browser. Do not open `index.html` directly.

The existing demo login remains `admin` / `Prime123!`. The existing sign-up/login flow has been kept unchanged and still stores its demo accounts in the browser; the SQLite database is used for the five business data collections listed above. Keep the terminal/server running while using the application.

### Database location

`prime-auto-sales.db` is generated in the project root after the first run. You can inspect it in VS Code with a SQLite extension, for example **SQLite** by alexcvzz. The schema includes the customer, vehicle, sales, enquiries and bookings tables, with foreign-key links where appropriate.
