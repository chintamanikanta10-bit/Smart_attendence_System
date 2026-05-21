import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def send_salary_slip_email(employee_name, employee_email, month, year, attendance_summary, basic_salary, deductions, net_salary):
    if not employee_email:
        print(f"Skipping email for {employee_name} (no email provided)")
        return False
    
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    
    if not smtp_user or not smtp_password:
        print("SMTP credentials not configured in .env")
        return False
    
    try:
        month_names = {
            1: "January", 2: "February", 3: "March", 4: "April",
            5: "May", 6: "June", 7: "July", 8: "August",
            9: "September", 10: "October", 11: "November", 12: "December"
        }
        month_name = month_names.get(month, str(month))
        
        subject = f"Salary Slip - {month_name} {year} - {employee_name}"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">Salary Slip</h1>
                </div>
                <div style="border: 1px solid #e2e8f0; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Dear {employee_name},</h2>
                    <p style="color: #475569; line-height: 1.6;">Please find your salary slip for the month of {month_name} {year} attached below.</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1e293b; margin-top: 0; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Salary Details</h3>
                        <table style="width: 100%; margin-top: 15px;">
                            <tr>
                                <td style="padding: 8px 0; color: #475569;"><strong>Employee Name:</strong></td>
                                <td style="padding: 8px 0; color: #1e293b;">{employee_name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #475569;"><strong>Month:</strong></td>
                                <td style="padding: 8px 0; color: #1e293b;">{month_name} {year}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #475569;"><strong>Basic Salary:</strong></td>
                                <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">₹{basic_salary:,.2f}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #475569;"><strong>Deductions:</strong></td>
                                <td style="padding: 8px 0; color: #dc2626; font-weight: bold;">₹{deductions:,.2f}</td>
                            </tr>
                            <tr style="border-top: 2px solid #e2e8f0;">
                                <td style="padding: 12px 0; color: #1e293b; font-size: 18px;"><strong>Net Salary:</strong></td>
                                <td style="padding: 12px 0; color: #2563eb; font-size: 18px; font-weight: bold;">₹{net_salary:,.2f}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
                        <h4 style="color: #166534; margin-top: 0;">Attendance Summary</h4>
                        <p style="color: #15803d; margin: 5px 0;">{attendance_summary}</p>
                    </div>
                    
                    <p style="color: #94a3b8; margin-top: 30px; font-size: 14px;">If you have any questions regarding your salary slip, please reply to this email.</p>
                </div>
            </body>
        </html>
        """
        
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = employee_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(html_content, 'html'))
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            text = msg.as_string()
            server.sendmail(smtp_user, employee_email, text)
        
        print(f"Successfully sent salary slip email to {employee_name} at {employee_email}")
        return True
        
    except Exception as e:
        print(f"Failed to send email to {employee_name}: {str(e)}")
        return False
