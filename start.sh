#!/bin/bash
set -e

echo "Starting Recipe Recommender..."
gunicorn -w 1 -b 0.0.0.0:8000 app:app
