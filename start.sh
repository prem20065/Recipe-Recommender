#!/bin/bash
set -e

echo "Starting Recipe Recommender..."
cd /opt/render/project/src
gunicorn -w 1 -b 0.0.0.0:8000 app:app
