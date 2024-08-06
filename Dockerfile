FROM python:3.12

WORKDIR /app

# Copy requirements file from the server directory
COPY server/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy your application files to the container
COPY . .

# Run your Flask app, loading .env
CMD ["python", "-m", "dotenv", "run", "-v", "--", "python", "server/main.py"] 
