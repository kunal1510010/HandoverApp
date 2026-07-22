#!/usr/bin/env bash
# Render build: frontend build -> collectstatic -> migrate -> seed
set -o errexit

# 1. frontend
cd frontend && npm ci && npm run build && cd ..

# 2. backend
cd backend
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
python manage.py loaddata checklist flats rooms
