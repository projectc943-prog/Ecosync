import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = os.getenv("EMAIL_USER")
        self.sender_password = os.getenv("EMAIL_PASS").replace(" ", "") if os.getenv("EMAIL_PASS") else None
        
        if not self.sender_email or not self.sender_password:
            logger.warning("⚠️ Email Service: Credentials missing in .env")
            print("⚠️ EMAIL SERVICE: Credentials MISSING!")
        else:
            print(f"✅ EMAIL SERVICE: Loaded credentials for {self.sender_email}")

    def _get_html_template(self, device_name, timestamp, alert_data, ai_insight, dashboard_link, title="🚨 Safety Alert Triggered"):
        """
        Generates a rich HTML email template.
        alert_data: List of dicts { 'metric': 'Temperature', 'value': '45°C', 'limit': '40°C', 'status': 'CRITICAL' }
        """
        
        # Build Rows
        rows_html = ""
        for item in alert_data:
            color = "#ef4444" if "CRITICAL" in item['status'] else ("#f97316" if "MODERATE" in item['status'] else "#22c55e")
            rows_html += f"""
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; font-weight: 600; color: #1e293b;">{item['metric']}</td>
                <td style="padding: 12px; font-weight: 700; color: {color}; font-size: 16px;">{item['value']}</td>
                <td style="padding: 12px; color: #64748b;">{item['limit']}</td>
                <td style="padding: 12px;"><span style="background-color: {color}20; color: {color}; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">{item['status']}</span></td>
            </tr>
            """

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
                .header {{ background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px 20px; text-align: center; color: white; }}
                .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }}
                .header p {{ margin: 5px 0 0; opacity: 0.9; font-size: 14px; }}
                .content {{ padding: 24px; }}
                .card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; }}
                .label {{ font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 4px; display: block; }}
                .value {{ font-size: 15px; color: #0f172a; font-weight: 600; }}
                .btn {{ display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 10px; }}
                .footer {{ background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
                table {{ width: 100%; border-collapse: collapse; }}
                .insight-box {{ background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{title}</h1>
                    <p>{device_name} • {timestamp}</p>
                </div>
                
                <div class="content">
                    <p style="color: #475569; margin-bottom: 20px;">
                        <strong>Action Required:</strong> Environmental risks undetected. Review the analysis below.
                    </p>

                    <!-- Data Table -->
                    <div style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        <table>
                            <thead style="background: #f8fafc;">
                                <tr>
                                    <th style="text-align: left; padding: 12px; font-size: 11px; color: #64748b; text-transform: uppercase;">Metric</th>
                                    <th style="text-align: left; padding: 12px; font-size: 11px; color: #64748b; text-transform: uppercase;">Current</th>
                                    <th style="text-align: left; padding: 12px; font-size: 11px; color: #64748b; text-transform: uppercase;">Limit</th>
                                    <th style="text-align: left; padding: 12px; font-size: 11px; color: #64748b; text-transform: uppercase;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows_html}
                            </tbody>
                        </table>
                    </div>

                    <!-- AI Insight -->
                    <div class="insight-box">
                        <span class="label" style="color: #3b82f6;">🤖 Risk Analysis & Harm Prevention</span>
                        <p style="margin: 5px 0 0; color: #1e40af; font-size: 14px; line-height: 1.5;">
                            {ai_insight or "Analysis complete."}
                        </p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="{dashboard_link}" class="btn">View Live Dashboard</a>
                    </div>
                </div>

                <div class="footer">
                    EcoSync Sentinel System • Automated Safety Monitoring<br>
                    Location: Unknown Sector
                </div>
            </div>
        </body>
        </html>
        """
        return html

    def send_alert(self, recipients, device_name, timestamp, alert_data, ai_insight, dashboard_link, title="🚨 Safety Alert Triggered"):
        if not self.sender_email or not self.sender_password:
            return False

        try:
            # Generate Body
            html_body = self._get_html_template(device_name, timestamp, alert_data, ai_insight, dashboard_link, title)
            
            # Setup Message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.sender_email
            msg['Subject'] = f"{title}: {device_name}"
            msg.attach(MIMEText(html_body, 'html'))

            # Send
            print(f"🔄 SMTP: Connecting to {self.smtp_server}:{self.smtp_port}...")
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            print("🔑 SMTP: Logging in...")
            server.login(self.sender_email, self.sender_password)
            
            for recipient in recipients:
                msg['To'] = recipient
                print(f"📨 SMTP: Sending to {recipient}...")
                server.sendmail(self.sender_email, recipient, msg.as_string())
                logger.info(f"📧 Rich Email sent to {recipient}")
                print(f"✅ SMTP: Sent to {recipient}")

            server.quit()
            return True

        except Exception as e:
            logger.error(f"❌ Email Service Error: {e}")
            print(f"❌ SMTP ERROR: {e}")
            return False

# Singleton
email_notifier = EmailService()

def send_email_notification(to_email, subject, body):
    """
    Legacy wrapper for simple text emails (used by Auth/OTP)
    """
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = email_notifier.sender_email
    msg['To'] = to_email

    try:
        with smtplib.SMTP(email_notifier.smtp_server, email_notifier.smtp_port) as server:
            server.starttls()
            server.login(email_notifier.sender_email, email_notifier.sender_password)
            server.sendmail(email_notifier.sender_email, [to_email], msg.as_string())
            logger.info(f"📧 Legacy Email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"❌ Legacy Email Error: {e}")
        return False
