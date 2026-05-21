import os
import sys
# add parent to sys path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.database.database import get_db
from backend.models.models import Attendance

db = next(get_db())

attendances = db.query(Attendance).all()
seen = set()
to_delete = []

for a in attendances:
    key = (a.employee_id, a.attendance_date)
    if key in seen:
        to_delete.append(a.id)
    else:
        seen.add(key)

if to_delete:
    db.query(Attendance).filter(Attendance.id.in_(to_delete)).delete(synchronize_session=False)
    db.commit()
    print(f"Deleted {len(to_delete)} duplicate records.")
else:
    print("No duplicates found.")
