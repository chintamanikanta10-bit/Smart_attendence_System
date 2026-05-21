# 🚀 Smart Attendance & Salary Management System

A modern full-stack Employee Attendance & Payroll Automation Platform built using **FastAPI, React, SQLite, Tailwind CSS, and Pandas**.

This project is designed to automate attendance processing, leave tracking, salary calculations, holiday management, report generation, and employee management through an intuitive dashboard interface.

The system converts raw biometric attendance Excel sheets into complete salary reports with automated calculations, analytics, and export features.

---

# 📌 Features at a Glance

✅ Employee Attendance Management
✅ Automated Salary Processing
✅ Excel Attendance Upload & Parsing
✅ Leave & CL (Casual Leave) Management
✅ Holiday & Sunday Detection
✅ LOP (Loss of Pay) Calculation
✅ Employee Dashboard & Analytics
✅ Salary Report Generation
✅ CSV Export Functionality
✅ Email Integration Ready
✅ SQLite Database Support
✅ Responsive Modern UI
✅ FastAPI REST APIs
✅ React + Tailwind Frontend
✅ Modular Full-Stack Architecture
---

# 📂 Project Folder Structure

```bash
Smart_Attendance_System/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── requirements.txt
│   └── uploads/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── charts/
│   │   ├── services/
│   │   └── App.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── sample_attendance.xlsx
├── README.md
└── .gitignore
```

---

# 🧠 Project Overview

The Smart Attendance & Salary Management System helps organizations automate employee attendance and payroll workflows.

Instead of manually calculating:

* Present Days
* Holidays
* Leave Balances
* LOP Days
* Monthly Salaries

…the system automatically processes uploaded Excel attendance sheets and generates complete salary calculations in seconds.

The platform also provides:

👉 Employee Management
👉 Attendance Analytics
👉 Salary Reports
👉 Exportable Data
👉 Dashboard Visualizations
👉 Automated Payroll Logic

---

# 🏗 System Architecture

## 1️⃣ Attendance Upload & Processing

* Upload biometric attendance Excel files
* Parse attendance records automatically
* Validate employee attendance entries
* Clean and process raw attendance data

---

## 2️⃣ Attendance Rule Engine

The system automatically detects:

* Present Days
* Sundays
* Public Holidays
* Casual Leave Usage
* Loss of Pay (LOP)
* Working Days

Attendance logic is dynamically processed based on uploaded records and configured rules.

---

## 3️⃣ Salary Calculation Engine

The payroll engine automatically:

* Calculates working days
* Computes per-day salary
* Applies leave deductions
* Handles carry-forward CL logic
* Calculates final monthly salary

### Salary Formula

genui{"math_block_widget_always_prefetch_v2":{"content":"Final\ Salary = Monthly\ Salary - (LOP\ Days \times Per\ Day\ Salary)"}}

---

## 4️⃣ Employee Management

The system supports:

* Add Employee
* Edit Employee
* Employee Salary Configuration
* Department Management
* Employee Record Tracking

---

## 5️⃣ Database Layer

Built using SQLite with SQLAlchemy ORM.

Features:

* Fast querying
* Employee record storage
* Attendance history
* Salary tracking
* Holiday management
* Leave balance management

The database can also be upgraded easily to PostgreSQL or MySQL.

---

## 6️⃣ Dashboard & Analytics

Interactive dashboard provides:

* Attendance graphs
* Salary analytics
* Employee overview
* Monthly summaries
* Attendance trends
* Data visualization charts

---

# 🚀 End-to-End Workflow

When attendance data is uploaded:

1️⃣ Excel Sheet Upload
2️⃣ Attendance Parsing
3️⃣ Employee Validation
4️⃣ Present/Leave Detection
5️⃣ Holiday Calculation
6️⃣ Salary Processing
7️⃣ Database Storage
8️⃣ Report Generation
9️⃣ Dashboard Visualization
🔟 Export & Reporting

---

# 🖥️ Frontend Features

Built using:

* React.js
* Vite
* Tailwind CSS
* Lucide Icons
* Recharts

### Frontend Modules

* Dashboard
* Attendance Upload
* Employee Management
* Salary Reports
* Analytics Charts
* Export System
* Responsive UI

---

# ⚙️ Backend Features

Built using:

* FastAPI
* SQLAlchemy
* Pandas
* OpenPyXL
* SQLite

### Backend Responsibilities

* API handling
* Excel processing
* Salary calculations
* Attendance logic
* Database operations
* Report generation

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone <your-repository-url>
cd Smart_Attendance_System
```

---

## 2️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at:

```bash
http://localhost:8000
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```bash
http://localhost:5173
```

---

# 📊 Using the System

## Step 1

Open the frontend dashboard.

## Step 2

Navigate to:

```bash
Attendance Upload
```

## Step 3

Upload the attendance Excel sheet.

Example:

```bash
sample_attendance.xlsx
```

## Step 4

Go to:

```bash
Salary Reports
```

## Step 5

Select:

* Month
* Year

…and run salary processing.

---

# 📈 Generated Outputs

The system automatically generates:

✅ Employee Attendance Summary
✅ Present Days
✅ Holiday Count
✅ Leave Usage
✅ LOP Days
✅ Final Salary Reports
✅ Dashboard Analytics
✅ CSV Export Files

---

# 🧩 Key Modules Explained

## 1. Attendance Upload Module

Handles:

* Excel parsing
* File validation
* Attendance extraction

---

## 2. Salary Engine

Handles:

* Payroll calculations
* Leave deduction
* LOP calculations
* Final salary generation

---

## 3. Leave Management

Handles:

* CL tracking
* Carry-forward logic
* Leave usage updates

---

## 4. Dashboard Analytics

Handles:

* Graphs
* Employee statistics
* Salary trends
* Attendance metrics

---

## 5. Export Module

Handles:

* CSV exports
* Attendance reports
* Salary reports

---

# 🛡 Attendance Rules Implemented

## ✅ Present Rule

Employee marked present when both:

* In Time exists
* Out Time exists

---

## ✅ Sunday Rule

Sundays automatically excluded from working days.

---

## ✅ Holiday Rule

Public holidays fetched and applied dynamically.

---

## ✅ Casual Leave Rule

Available CL balance is consumed before LOP deduction.

---

## ✅ LOP Rule

If leave exceeds available CL:

```bash
LOP = Leaves - Available CL
```

Salary deduction applied automatically.

---

# 🧱 Tech Stack

| Component        | Technology        |
| ---------------- | ----------------- |
| Frontend         | React.js          |
| Styling          | Tailwind CSS      |
| Backend          | FastAPI           |
| Database         | SQLite            |
| ORM              | SQLAlchemy        |
| Excel Processing | Pandas + OpenPyXL |
| Charts           | Recharts          |
| Build Tool       | Vite              |
| Icons            | Lucide React      |

---

# 📌 Future Enhancements

🔹 Employee Login & Authentication
🔹 Email Salary Slip Delivery
🔹 PDF Salary Slip Generation
🔹 AI-based Attendance Insights
🔹 Real-Time Notifications
🔹 PostgreSQL Deployment
🔹 Cloud Hosting Support
🔹 Role-Based Access Control
🔹 Mobile Responsive Improvements
🔹 Multi-Branch Support

---

# 👥 Contributors

## 👨‍💻 Project Developer

Kamakshi Kamalika — 
Jagadeesh-
Hrithvika-
Varshith-

---

# ⭐ Support the Project

If you like this project, consider giving it a ⭐ on GitHub!

---

# 📄 License

This project is intended for educational and organizational use.
