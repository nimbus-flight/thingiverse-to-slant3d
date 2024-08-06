FROM python:3.12

WORKDIR /app

# Install python-dotenv and other dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your application files to the container
COPY . .

# Install python-dotenv
RUN pip install --no-cache-dir python-dotenv

# Run your Flask app, loading .env
CMD ["python", "-m", "dotenv", "run", "-v", "--", "python", "server/main.py"] 
