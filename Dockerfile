# Multi-stage Dockerfile for FastAPI + Vite application

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Copy frontend package files
COPY frontend/package*.json ./
COPY frontend/.npmrc ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Build Python backend
FROM python:3.12-slim AS backend-builder

WORKDIR /app

# Install system dependencies for PDF processing
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Stage 3: Final production image
FROM python:3.12-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies from builder
COPY --from=backend-builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy backend application
COPY backend/. /app/app
COPY backend/gunicorn.conf.py /app/

# Copy built frontend to nginx web root
COPY --from=frontend-builder /frontend/dist /var/www/html

# Copy nginx configuration
COPY nginx/nginx.prod.conf /etc/nginx/nginx.conf

# Copy supervisor configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create required directories
RUN mkdir -p /var/log/supervisor /var/log/nginx /var/log/gunicorn

# Expose port
EXPOSE 80

# Set environment variables
ENV PYTHONPATH=/app/app \
    PYTHONUNBUFFERED=1

ENV P_ENV=production
ENV P_PORT=8000
# Start supervisor (which will manage nginx and gunicorn)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]