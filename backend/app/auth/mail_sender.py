import os
import smtplib

from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

EMAIL = os.getenv("EMAIL")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")




def send_otp(receiver_email: str, otp: str):

    subject = "Garuda Password Reset OTP"

    body = f"""
Hello,

Your Garuda OTP is:

{otp}

This OTP is valid for 5 minutes.

Do not share this OTP with anyone.

Regards,
Garuda Team
"""

    message = MIMEText(body)

    message["Subject"] = subject
    message["From"] = EMAIL
    message["To"] = receiver_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)

        print("Connected to Gmail SMTP")

        server.ehlo()
        server.starttls()
        server.ehlo()

        print("TLS Started")
        print("Logging into Gmail...")

        server.login(
            EMAIL,
            EMAIL_PASSWORD
        )

        print("Login Success")

        server.sendmail(
            EMAIL,
            receiver_email,
            message.as_string()
        )

        print("OTP Sent Successfully")

        server.quit()

    except Exception as e:
        print("SMTP ERROR:", repr(e))
        raise