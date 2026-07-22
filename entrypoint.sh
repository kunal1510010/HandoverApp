#!/usr/bin/env bash
# Runs on the actual service instance (unlike Render's build/pre-deploy steps,
# this has the persistent disk mounted), so migrations and seed data land on it.
set -o errexit

python manage.py migrate
python manage.py loaddata checklist flats rooms

# Optional: create a superuser from env vars so /admin/ is reachable without
# Shell access (paid-only on Render) — get_or_create keeps this idempotent
# and self-healing across the free plan's filesystem resets.
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  python manage.py shell -c "
from django.contrib.auth.models import User
import os
username = os.environ['DJANGO_SUPERUSER_USERNAME']
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, os.environ.get('DJANGO_SUPERUSER_EMAIL', ''), os.environ['DJANGO_SUPERUSER_PASSWORD'])
"
fi

# --preload loads the app before forking the worker, so it's ready to accept
# a request the instant it's forked instead of racing Render's health check.
exec gunicorn config.wsgi:application --bind 0.0.0.0:"${PORT:-8000}" --preload
