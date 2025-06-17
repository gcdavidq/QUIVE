# correo_utils.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configuración SMTP (ejemplo: Gmail)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "akuntsueharu@gmail.com"  # Cambiar por tu correo
SMTP_PASSWORD = "fhxw jkwe pnwl jtqg"  # Usa contraseña de aplicación si es Gmail

def enviar_email(destinatario, asunto, mensaje_html):
    msg = MIMEMultipart()
    msg['From'] = SMTP_USER
    msg['To'] = destinatario
    msg['Subject'] = asunto

    msg.attach(MIMEText(mensaje_html, 'html'))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print("Error enviando correo:", e)
        return False