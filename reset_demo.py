"""
Clear demo data: all non-admin users (normal users and experts), expert
applications, scans, expert reviews, complaints and uploaded files.
Admin accounts, the test set, model weights and calibration are kept.
Run from the project folder:  python reset_demo.py
"""
import os
import shutil
import sys
import time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'deepfake_backend.settings')
import django
django.setup()

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.db import connection, transaction
from detector import models as m

base = str(settings.BASE_DIR)
uploads = os.path.join(str(settings.MEDIA_ROOT), 'uploads')
admins = list(User.objects.filter(is_staff=True).values_list('username', flat=True))
others = User.objects.filter(is_staff=False)

print('Will KEEP these admin accounts:', ', '.join(admins) or '(none!)')
print('Will DELETE:')
print(f'  {others.count()} user/expert accounts')
print(f'  {m.ExpertApplication.objects.count()} expert applications')
print(f'  {m.ScanResult.objects.count()} scans, {m.ExpertReview.objects.count()} expert reviews')
if hasattr(m, 'Complaint'):
    print(f'  {m.Complaint.objects.count()} complaints')
n_files = sum(len(f) for _, _, f in os.walk(uploads)) if os.path.isdir(uploads) else 0
print(f'  {n_files} uploaded files in media/uploads')
if not admins:
    sys.exit('No admin account found. Create one first: python manage.py createsuperuser')
if input('Type YES to continue: ').strip() != 'YES':
    sys.exit('Nothing changed.')

# Backup first
stamp = time.strftime('%Y%m%d-%H%M%S')
backup = os.path.join(os.path.dirname(base), f'reality_check_backup_{stamp}')
os.makedirs(backup, exist_ok=True)
shutil.copy2(os.path.join(base, 'db.sqlite3'), backup)
if os.path.isdir(uploads):
    shutil.copytree(uploads, os.path.join(backup, 'uploads'))
print('Backup saved to', backup)

with transaction.atomic():
    if hasattr(m, 'Complaint'):
        m.Complaint.objects.all().delete()
    m.ScanResult.objects.all().delete()
    m.ExpertReview.objects.all().delete()
    m.ExpertApplication.objects.all().delete()
    others.delete()
    Session.objects.all().delete()

# Start case numbers from 1 again
if connection.vendor == 'sqlite':
    with connection.cursor() as cur:
        cur.execute("SELECT name FROM sqlite_master WHERE name='sqlite_sequence'")
        if cur.fetchone():
            cur.execute("DELETE FROM sqlite_sequence WHERE name LIKE 'detector_%'")

if os.path.isdir(uploads):
    shutil.rmtree(uploads)
os.makedirs(uploads, exist_ok=True)

print('Done. Kept admin accounts:', ', '.join(admins))
