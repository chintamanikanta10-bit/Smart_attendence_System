# Smart Employee Attendance & Salary Processing System

## Overview
A high-performance full-stack web application designed to process monthly biometric attendance Excel sheets and automatically calculate attendance stats, leave balances, and final salary.

## Features Added:
- FastAPI Backend (High-performance API)
- React Frontend (Vite + Tailwind CSS + Lucide React for modern UI)
- SQLite Database via SQLAlchemy (Easily swappable to PostgreSQL)
- Attendance upload & automatic parsing (Rules: Present, Leaves, Sunday, Public Holiday)
- Employee Salary calculations based on Working Days and Carry Forward CL logic.

## Recommended Tech Stack (Implemented):
- **Frontend**: React.js, Tailwind CSS
- **Backend**: FastAPI
- **Database**: SQLite (Ready for PostgreSQL)
- **Data Processing**: pandas, openpyxl

## Setup Instructions

### 1. Backend Setup:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
(Backend will run at http://localhost:8000)

### 2. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
(Frontend will run at http://localhost:5173)

### 3. Usage:
1. Open the Frontend URL.
2. Go to "Attendance Upload".
3. Upload the generated `sample_attendance.xlsx` file available in the root folder.
4. Go to "Salary Reports", enter the Month (5) and Year (2026), and click "Run Processing" to see the processed outputs.
5. The system will calculate Present days, Leaves, Holidays, CL Used, LOP days, and Final Salary.

## Important Logic Implementations:
- **Rule 1 (Present)**: Assessed when both In and Out times are strictly present.
- **Rule 2/3 (Holidays)**: Checked using calendar weekday indexing and SQLite stored dates. 
- **Rule 5/6 (Leaves/CL)**: Uses a rolling LeaveBalance table updating available, used, and carry_forward entries dynamically per processing action.
- **Rule 7 (LOP & Salary Calculation)**: Working days calculated automatically. Formula `(Total Days - Holidays - Sundays)`. Per day salary mapped, and mapped against `LOP = Leaves - Available CL`.
