FROM python:3.12

WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy your application files to the container
COPY . .

# Run your Flask app with Waitress
CMD ["waitress-serve", "--port=8080", "server.main:app"]
