import pandas as pd
from datetime import datetime, time
from sqlalchemy.orm import Session
from sqlalchemy import tuple_
from backend.models.models import Employee, Attendance, Holiday, UploadedFileDB
from backend.services.attendance_service import determine_attendance_status
import os

def process_attendance_excel(file_path: str, db: Session):
    df = pd.read_excel(file_path)
    df.columns = df.columns.astype(str).str.strip()
    
    holidays = db.query(Holiday).all()
    holiday_dates = {h.holiday_date: h.holiday_name for h in holidays}
    
    filename = os.path.basename(file_path)
    
    import re
    def extract_index(c_name):
        res = re.findall(r'\d+', c_name)
        return int(res[-1]) if res else None

    date_cols = [c for c in df.columns if c.lower().startswith('date')]
    in_cols = [c for c in df.columns if c.lower().startswith('time in') or c.lower() == 'in time' or 'in time' in c.lower()]
    out_cols = [c for c in df.columns if c.lower().startswith('time out') or c.lower() == 'out time' or 'out time' in c.lower()]

    groups = {}
    for c in date_cols:
        idx = extract_index(c)
        if idx is not None: groups.setdefault(idx, {})['date'] = c
    for c in in_cols:
        idx = extract_index(c)
        if idx is not None: groups.setdefault(idx, {})['in'] = c
    for c in out_cols:
        idx = extract_index(c)
        if idx is not None: groups.setdefault(idx, {})['out'] = c
            
    if not groups and len(date_cols) == 1 and len(in_cols) == 1 and len(out_cols) == 1:
        groups[1] = {'date': date_cols[0], 'in': in_cols[0], 'out': out_cols[0]}

    all_emps_db = db.query(Employee.id, Employee.employee_id, Employee.employee_name).all()
    emp_by_id = {str(e.employee_id).strip().lower(): e.id for e in all_emps_db}
    emp_by_name = {str(e.employee_name).strip().lower(): e.id for e in all_emps_db}
    
    attendance_dicts = []
    seen = set()
    
    records = df.to_dict('records')
    
    for row in records:
        emp_id_str = str(row.get('Employee ID', '')).strip().lower()
        original_emp_name = str(row.get('Employee Name', '')).strip()
        emp_name_str = original_emp_name.lower()
        
        emp_id = emp_by_id.get(emp_id_str) or emp_by_name.get(emp_name_str)
        if not emp_id:
            continue
            
        for g in groups.values():
            if 'date' not in g or 'in' not in g or 'out' not in g:
                continue
                
            d_val = row.get(g['date'])
            in_val = row.get(g['in'])
            out_val = row.get(g['out'])
            
            if pd.isna(d_val) or str(d_val).strip().lower() in ('nan', 'nat', 'null', ''):
                continue
                
            try:
                att_date = pd.to_datetime(d_val, dayfirst=True).date()
            except:
                continue
                
            in_t = None
            out_t = None
            if pd.notna(in_val) and str(in_val).strip().lower() not in ('nan', 'nat', 'null', ''):
                try:
                    parsed_in = pd.to_datetime(str(in_val))
                    in_t = parsed_in.time() if isinstance(in_val, str) else in_val
                    if isinstance(in_t, datetime): in_t = in_t.time()
                except: pass
            
            if pd.notna(out_val) and str(out_val).strip().lower() not in ('nan', 'nat', 'null', ''):
                try:
                    parsed_out = pd.to_datetime(str(out_val))
                    out_t = parsed_out.time() if isinstance(out_val, str) else out_val
                    if isinstance(out_t, datetime): out_t = out_t.time()
                except: pass
                
            status = determine_attendance_status(att_date, in_t, out_t, holiday_dates)
            
            key = (emp_id, att_date)
            if key not in seen:
                attendance_dicts.append({
                    "employee_id": emp_id,
                    "employee_name": original_emp_name,
                    "attendance_date": att_date,
                    "in_time": in_t,
                    "out_time": out_t,
                    "month": att_date.month,
                    "year": att_date.year,
                    "status": status,
                    "source_file": filename
                })
                seen.add(key)

    if not attendance_dicts:
        return 0, None, None
        
    # Delete existing entries for these emp/date combinations to avoid duplicates safely
    # For large datasets, tuple_ in_ can be slow, but SQLite handles it alright if chunks are small.
    # Alternatively, delete between min / max dates for employees present in the batch.
    emp_ids_in_batch = list({a["employee_id"] for a in attendance_dicts})
    min_date = min(a["attendance_date"] for a in attendance_dicts)
    max_date = max(a["attendance_date"] for a in attendance_dicts)
    
    # Bulk delete: delete all records for these employees in this date range FROM THE SAME FILE or any file?
    # Requirement: "remove uploaded file -> remove corresponding attendance records" 
    # Actually, we should just delete attendance for this source_file.
    db.query(Attendance).filter(
        Attendance.source_file == filename
    ).delete(synchronize_session=False)
    
    # Insert new correctly
    db.bulk_insert_mappings(Attendance, attendance_dicts)
    db.commit()
    
    return len(attendance_dicts), min_date.month, min_date.year
