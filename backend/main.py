from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from backend.database.database import engine, Base, get_db
from backend.models.models import Employee, Holiday, SalaryRecord, Attendance, LeaveBalance, UploadedFileDB
from backend.services.excel_processor import process_attendance_excel
from backend.services.salary_service import calculate_monthly_salary
from backend.services.email_service import send_salary_slip_email
import shutil
import os
import holidays
from pydantic import BaseModel
from datetime import datetime

Base.metadata.create_all(bind=engine)

def ensure_leave_balance_columns():
    new_columns = [
        ("monthly_comp_off_earned", "FLOAT DEFAULT 0.0"),
        ("carry_forward_comp_off", "FLOAT DEFAULT 0.0"),
        ("total_available_comp_off", "FLOAT DEFAULT 0.0"),
        ("used_comp_off", "FLOAT DEFAULT 0.0"),
        ("remaining_comp_off", "FLOAT DEFAULT 0.0")
    ]
    with engine.begin() as conn:
        if engine.dialect.name == "sqlite":
            existing = {row[1] for row in conn.execute(text("PRAGMA table_info(leave_balance)"))}
        else:
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'leave_balance'"))
            existing = {row[0] for row in result}

        for name, definition in new_columns:
            if name not in existing:
                conn.execute(text(f"ALTER TABLE leave_balance ADD COLUMN {name} {definition}"))

ensure_leave_balance_columns()

def ensure_email_column():
    with engine.begin() as conn:
        if engine.dialect.name == "sqlite":
            existing = {row[1] for row in conn.execute(text("PRAGMA table_info(employees)"))}
        else:
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'employees'"))
            existing = {row[0] for row in result}
        
        if "email" not in existing:
            conn.execute(text("ALTER TABLE employees ADD COLUMN email VARCHAR"))

ensure_email_column()

app = FastAPI(title="Smart Employee Attendance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmployeeCreate(BaseModel):
    employee_id: str
    employee_name: str
    department: str
    salary: float
    email: str | None = None

@app.get("/")
def read_root():
    return {"message": "Attendance System API"}

@app.post("/api/upload_attendance/")
def upload_attendance(files: list[UploadFile] = File(...), db: Session = Depends(get_db)):
    total_records = 0
    import re
    # To detect month from filename: e.g., "january_attendance.xlsx", "april_2026.xlsx"
    months_map = {"january":1, "february":2, "march":3, "april":4, "may":5, "june":6, "july":7, "august":8, "september":9, "october":10, "november":11, "december":12}
    
    for file in files:
        if not file.filename.endswith(('.xls', '.xlsx')):
            continue
        
        file_path = f"backend/uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        records_saved, parsed_month, parsed_year = process_attendance_excel(file_path, db)
        total_records += records_saved
        
        # Determine month and year
        fname = file.filename.lower()
        file_month = parsed_month
        file_year = parsed_year
        
        # Fallback to filename
        for m_name, m_num in months_map.items():
            if m_name in fname:
                file_month = m_num
                break
                
        # Look for 4 digit year in filename
        year_match = re.search(r'\b(20\d{2})\b', fname)
        if year_match:
            file_year = int(year_match.group(1))
            
        if not file_month: file_month = datetime.now().month
        if not file_year: file_year = datetime.now().year
        
        # Save to DB
        existing_file = db.query(UploadedFileDB).filter(UploadedFileDB.file_name == file.filename).first()
        if existing_file:
            db.delete(existing_file)
            db.commit()
            
        new_file = UploadedFileDB(
            file_name=file.filename,
            month=file_month,
            year=file_year,
            upload_date=datetime.now().date(),
            total_employees=db.query(Attendance.employee_id).filter(Attendance.source_file == file.filename).distinct().count()
        )
        db.add(new_file)
        db.commit()
        
    return {"message": f"Successfully processed {total_records} attendance records."}

@app.get("/api/attendance/")
def get_attendance(db: Session = Depends(get_db)):
    # Return latest 100 records
    attendances = db.query(Attendance).order_by(Attendance.attendance_date.desc()).limit(100).all()
    results = []
    for a in attendances:
        emp = db.query(Employee).filter(Employee.id == a.employee_id).first()
        results.append({
            "employee_id": emp.employee_id if emp else "Unknown",
            "employee_name": emp.employee_name if emp else "Unknown",
            "date": a.attendance_date,
            "in_time": a.in_time.strftime("%H:%M:%S") if a.in_time else "NULL",
            "out_time": a.out_time.strftime("%H:%M:%S") if a.out_time else "NULL",
        })
    return results

@app.get("/api/dashboard_stats/")
def get_dashboard_stats(db: Session = Depends(get_db)):

    total_employees = db.query(Employee).count()

    total_holidays = db.query(Holiday).count()

    total_departments = (
        db.query(Employee.department)
        .distinct()
        .count()
    )

    return {
        "total_employees": total_employees,
        "total_holidays": total_holidays,
        "total_departments": total_departments
    }

@app.post("/api/calculate_salary/")
def calc_salary(month: int, year: int, db: Session = Depends(get_db), send_email: bool = False):
    results = calculate_monthly_salary(db, month, year)
    
    if send_email:
        for res in results:
            emp = db.query(Employee).filter(Employee.employee_id == res["employee_id"]).first()
            if emp:
                attendance_summary = f"Present: {res['present_days']} days, Leave: {res['leave_days']} days, LOP: {res['lop_days']} days"
                send_salary_slip_email(
                    employee_name=emp.employee_name,
                    employee_email=emp.email,
                    month=month,
                    year=year,
                    attendance_summary=attendance_summary,
                    basic_salary=emp.salary,
                    deductions=res["deduction"],
                    net_salary=res["final_salary"]
                )
    
    return results

@app.get("/api/uploaded_files/")
def get_uploaded_files(db: Session = Depends(get_db)):
    files = db.query(UploadedFileDB).order_by(UploadedFileDB.upload_date.desc(), UploadedFileDB.id.desc()).all()
    results = []
    for f in files:
        results.append({
            "id": f.id,
            "filename": f.file_name,
            "month": f.month,
            "year": f.year,
            "upload_date": f.upload_date.isoformat() if f.upload_date else None,
            "total_employees": f.total_employees
        })
    print(f"Uploaded Files: {results}")
    return results

@app.delete("/api/uploaded_files/{file_id}")
def delete_uploaded_file(file_id: int, db: Session = Depends(get_db)):
    file_record = db.query(UploadedFileDB).filter(UploadedFileDB.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
        
    filename = file_record.file_name
    file_path = f"backend/uploads/{filename}"
    
    # 1. Remove attendance records
    db.query(Attendance).filter(Attendance.source_file == filename).delete(synchronize_session=False)
    
    # 2. To completely remove leave balance and salary, we might delete everything related to this month/year.
    # Note: If multiple files are uploaded for the same month, this deletes all salaries for the month.
    # The requirement: "remove corresponding attendance records, remove related leave balance records, remove related salary records"
    db.query(LeaveBalance).filter(LeaveBalance.month == file_record.month, LeaveBalance.year == file_record.year).delete(synchronize_session=False)
    db.query(SalaryRecord).filter(SalaryRecord.month == file_record.month, SalaryRecord.year == file_record.year).delete(synchronize_session=False)
    
    # 3. Remove DB record
    db.delete(file_record)
    db.commit()
    
    # 4. Remove physical file
    if os.path.exists(file_path):
        os.remove(file_path)
        
    return {"message": "File and related records deleted successfully."}

@app.get("/api/download_file/{file_id}")
def download_uploaded_file(file_id: int, db: Session = Depends(get_db)):
    file_record = db.query(UploadedFileDB).filter(UploadedFileDB.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
        
    filename = file_record.file_name
    file_path = f"backend/uploads/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Physical file missing")
        
    return FileResponse(path=file_path, filename=filename)

@app.post("/api/calculate_salary_file/")
def calc_salary_by_file(filename: str, db: Session = Depends(get_db), send_email: bool = False):
    file_record = db.query(UploadedFileDB).filter(UploadedFileDB.file_name == filename).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File metadata not found.")
        
    # Validation step 8
    if not file_record.month or not file_record.year:
        raise HTTPException(status_code=400, detail="Uploaded file metadata invalid.")
        
    # Debug Logs step 7
    print({"id": file_record.id, "filename": file_record.file_name, "month": file_record.month, "year": file_record.year})
    
    month = file_record.month
    year = file_record.year
    
    results = calculate_monthly_salary(db, month, year)
    
    if send_email:
        for res in results:
            emp = db.query(Employee).filter(Employee.employee_id == res["employee_id"]).first()
            if emp:
                attendance_summary = f"Present: {res['present_days']} days, Leave: {res['leave_days']} days, LOP: {res['lop_days']} days"
                send_salary_slip_email(
                    employee_name=emp.employee_name,
                    employee_email=emp.email,
                    month=month,
                    year=year,
                    attendance_summary=attendance_summary,
                    basic_salary=emp.salary,
                    deductions=res["deduction"],
                    net_salary=res["final_salary"]
                )
    
    return {"month": month, "year": year, "results": results}

@app.get("/api/leave_balances/")
def get_leave_balances(month: int, year: int, db: Session = Depends(get_db)):
    balances = db.query(LeaveBalance).filter(LeaveBalance.month == month, LeaveBalance.year == year).all()
    res = []
    for lb in balances:
        emp = db.query(Employee).filter(Employee.id == lb.employee_id).first()
        if not emp:
            continue
        res.append({
            "employee_id": emp.employee_id,
            "employee_name": emp.employee_name,
            "previous_cl": lb.carry_forward_cl,
            "current_cl": lb.monthly_cl,
            "total_available_cl": lb.total_available_cl,
            "used_cl": lb.used_cl,
            "remaining_cl": lb.remaining_cl,
            "previous_comp_off": lb.carry_forward_comp_off,
            "monthly_comp_off_earned": lb.monthly_comp_off_earned,
            "total_available_comp_off": lb.total_available_comp_off,
            "used_comp_off": lb.used_comp_off,
            "remaining_comp_off": lb.remaining_comp_off,
            "lop_days": lb.lop_days
        })
    return res

@app.get("/api/employees/")
def get_employees(db: Session = Depends(get_db)):
    return db.query(Employee).all()

@app.post("/api/employees/")
def add_employee(emp: EmployeeCreate, db: Session = Depends(get_db)):
    existing = db.query(Employee).filter(Employee.employee_id == emp.employee_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    new_emp = Employee(
        employee_id=emp.employee_id,
        employee_name=emp.employee_name,
        department=emp.department,
        salary=emp.salary,
        joining_date=datetime.now().date(),
        email=emp.email
    )
    db.add(new_emp)
    db.commit()
    return {"message": "Employee added successfully"}

class EmployeeUpdate(BaseModel):
    employee_id: str | None = None
    employee_name: str | None = None
    department: str | None = None
    salary: float | None = None
    email: str | None = None

@app.put("/api/employees/{emp_id}")
def update_employee(emp_id: str, emp_update: EmployeeUpdate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == emp_id).first()
    if not emp:
        try:
            emp_by_id = db.query(Employee).filter(Employee.id == int(emp_id)).first()
            if emp_by_id:
                emp = emp_by_id
        except ValueError:
            pass
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    update_data = emp_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(emp, key, value)
    
    db.commit()
    return {"message": "Employee updated successfully"}

@app.delete("/api/employees/{emp_id}")
def delete_employee(emp_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == emp_id).first()
    if not emp:
        # Also try by DB ID if passed
        try:
            emp_by_id = db.query(Employee).filter(Employee.id == int(emp_id)).first()
            if emp_by_id:
                emp = emp_by_id
        except ValueError:
            pass
            
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Delete related attendance and salary records
    db.query(Attendance).filter(Attendance.employee_id == emp.id).delete(synchronize_session=False)
    db.query(SalaryRecord).filter(SalaryRecord.employee_id == emp.id).delete(synchronize_session=False)
    # Also delete leave balance if exists
    db.query(LeaveBalance).filter(LeaveBalance.employee_id == emp.id).delete(synchronize_session=False)

    db.delete(emp)
    db.commit()
    return {"message": "Employee removed successfully."}

@app.get("/api/holidays/")
def get_holidays(db: Session = Depends(get_db)):
    return db.query(Holiday).order_by(Holiday.holiday_date).all()

@app.post("/api/fetch_holidays/")
def fetch_local_holidays(year: int, country: str = "IN", db: Session = Depends(get_db)):
    try:
        in_holidays = holidays.country_holidays(country, years=[year])
        count = 0
        for dt, name in in_holidays.items():
            existing = db.query(Holiday).filter(Holiday.holiday_date == dt).first()
            if not existing:
                h = Holiday(holiday_date=dt, holiday_name=name)
                db.add(h)
                count += 1
        db.commit()
        return {"message": f"Successfully imported {count} public holidays for {country} in {year}", "count": count}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
