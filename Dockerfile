FROM python:3.12

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your application files to the container
COPY . .

# Install python-dotenv
RUN pip install --no-cache-dir python-dotenv

# Copy the .env file into the container (don't forget to add this line)
COPY .env .

# Run your Flask app (make sure you have app.run() in your main file)
CMD ["python", "-m", "dotenv", "run", "-v", "--", "python", "main.py"]
