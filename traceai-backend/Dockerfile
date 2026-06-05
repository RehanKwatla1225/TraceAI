FROM python:3.12-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y \
    libpq-dev gcc curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

EXPOSE 8000

RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]