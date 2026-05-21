from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from backend.models.models import Employee, Attendance, LeaveBalance, SalaryRecord, Holiday
import calendar

def calculate_monthly_salary(db: Session, target_month: int, target_year: int):
    employees = db.query(Employee).all()
    holiday_dates = {h.holiday_date for h in db.query(Holiday).all()}
    results = []
    
    for emp in employees:
        # Find earliest attendance year/month for this employee
        # Using a direct query to minimize data loaded
        earliest_att = db.query(Attendance).filter(Attendance.employee_id == emp.id).order_by(Attendance.attendance_date.asc()).first()
        
        if not earliest_att:
            continue
            
        start_year = earliest_att.attendance_date.year
        start_month = earliest_att.attendance_date.month
        
        curr_year = start_year
        curr_month = start_month
        
        previous_remaining_cl = 0.0
        previous_remaining_comp_off = 0.0
        calculated = False
        
        while (curr_year < target_year) or (curr_year == target_year and curr_month <= target_month):
            att_records = db.query(Attendance).filter(
                Attendance.employee_id == emp.id,
                Attendance.month == curr_month,
                Attendance.year == curr_year
            ).all()
            
            # If no attendance records for this month, skip leave logic but maintain CF
            if not att_records:
                if curr_month == 12:
                    curr_month = 1
                    curr_year += 1
                else:
                    curr_month += 1
                continue
                
            present_count = sum(1 for r in att_records if r.status == "Present")
            # Count Absent and Leave both as leave_days
            leave_days = sum(1 for r in att_records if r.status in ["Absent", "Leave"])
            sunday_count = sum(1 for r in att_records if r.status == "Sunday")
            holiday_count = sum(1 for r in att_records if r.status == "Holiday")
            
            monthly_comp_off_earned = sum(
                1 for r in att_records
                if r.status == "Present" and (r.attendance_date.weekday() == 6 or r.attendance_date in holiday_dates)
            )
            
            # Working days calculation
            _, total_days_in_month = calendar.monthrange(curr_year, curr_month)
            working_days = total_days_in_month - sunday_count - holiday_count
            if working_days <= 0:
                working_days = 1
                
            current_month_cl = 1.0
            total_available_cl = previous_remaining_cl + current_month_cl
            total_available_comp_off = previous_remaining_comp_off + monthly_comp_off_earned
            
            if leave_days <= total_available_comp_off:
                used_comp_off = leave_days
                used_cl = 0.0
                remaining_comp_off = total_available_comp_off - leave_days
                remaining_cl = total_available_cl
                lop_days = 0.0
            elif leave_days <= total_available_comp_off + total_available_cl:
                used_comp_off = total_available_comp_off
                used_cl = leave_days - used_comp_off
                remaining_comp_off = 0.0
                remaining_cl = total_available_cl - used_cl
                lop_days = 0.0
            else:
                used_comp_off = total_available_comp_off
                used_cl = total_available_cl
                remaining_comp_off = 0.0
                remaining_cl = 0.0
                lop_days = leave_days - total_available_comp_off - total_available_cl
                
            # Update or create LeaveBalance
            lb = db.query(LeaveBalance).filter(
                LeaveBalance.employee_id == emp.id,
                LeaveBalance.month == curr_month,
                LeaveBalance.year == curr_year
            ).first()
            
            if not lb:
                lb = LeaveBalance(employee_id=emp.id, employee_name=emp.employee_name, month=curr_month, year=curr_year)
                db.add(lb)
                
            lb.monthly_cl = current_month_cl
            lb.carry_forward_cl = previous_remaining_cl
            lb.total_available_cl = total_available_cl
            lb.used_cl = used_cl
            lb.remaining_cl = remaining_cl
            lb.monthly_comp_off_earned = monthly_comp_off_earned
            lb.carry_forward_comp_off = previous_remaining_comp_off
            lb.total_available_comp_off = total_available_comp_off
            lb.used_comp_off = used_comp_off
            lb.remaining_comp_off = remaining_comp_off
            lb.lop_days = lop_days
            db.commit()
            
            # Calculate salary
            per_day_salary = emp.salary / working_days
            salary_deduction = lop_days * per_day_salary
            final_salary = emp.salary - salary_deduction
            
            # Update or create SalaryRecord
            sr = db.query(SalaryRecord).filter(
                SalaryRecord.employee_id == emp.id,
                SalaryRecord.month == curr_month,
                SalaryRecord.year == curr_year
            ).first()
            
            if not sr:
                sr = SalaryRecord(employee_id=emp.id, employee_name=emp.employee_name, month=curr_month, year=curr_year)
                db.add(sr)
                
            sr.working_days = working_days
            sr.present_days = present_count
            sr.leave_days = leave_days
            sr.lop_days = lop_days
            sr.salary_deduction = salary_deduction
            sr.final_salary = final_salary
            db.commit()
            
            if curr_year == target_year and curr_month == target_month:
                results.append({
                    "employee_id": emp.employee_id,
                    "employee_name": emp.employee_name,
                    "present_days": present_count,
                    "leave_days": leave_days,
                    "previous_cl": previous_remaining_cl,
                    "current_cl": current_month_cl,
                    "total_available_cl": total_available_cl,
                    "used_cl": used_cl,
                    "remaining_cl": remaining_cl,
                    "previous_comp_off": previous_remaining_comp_off,
                    "monthly_comp_off_earned": monthly_comp_off_earned,
                    "total_available_comp_off": total_available_comp_off,
                    "used_comp_off": used_comp_off,
                    "remaining_comp_off": remaining_comp_off,
                    "lop_days": lop_days,
                    "deduction": salary_deduction,
                    "final_salary": final_salary
                })
                calculated = True
                
            previous_remaining_cl = remaining_cl
            previous_remaining_comp_off = remaining_comp_off
            
            # Advance to next month
            if curr_month == 12:
                curr_month = 1
                curr_year += 1
            else:
                curr_month += 1
                
    return results
