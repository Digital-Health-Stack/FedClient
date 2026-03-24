FROM tensorflow/tensorflow:latest-gpu

# Set working directory
WORKDIR /app

# Copy requirements first for layer caching
COPY ./app/requirements.txt ./

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Optional: copy app source code into container
# COPY ./app ./ 

# Expose API port
EXPOSE 9090

# Run FastAPI with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9090"]
