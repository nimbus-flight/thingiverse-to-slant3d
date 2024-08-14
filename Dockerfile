FROM python:3.12

WORKDIR /app

# Copy requirements file from the server directory
COPY server/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy your application files to the container
COPY . .

# Run your Flask app with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--log-level", "info", "--access-logfile", "-", "--error-logfile", "-", "server.main:app"]
