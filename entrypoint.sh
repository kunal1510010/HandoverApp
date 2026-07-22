#!/usr/bin/env bash
# Runs on the actual service instance (unlike Render's build/pre-deploy steps,
# this has the persistent disk mounted), so migrations and seed data land on it.
set -o errexit

python manage.py migrate
python manage.py loaddata checklist flats rooms

# --preload loads the app before forking the worker, so it's ready to accept
# a request the instant it's forked instead of racing Render's health check.
exec gunicorn config.wsgi:application --bind 0.0.0.0:"${PORT:-8000}" --preload
