FROM node:21.6.1-slim

# Install common tools
RUN apt-get update \
    && apt-get -y install curl \
    && apt-get -y install wget \	
    && apt-get -y install jq \	
    && apt-get -y install gzip \	
    && rm -rf /var/lib/apt/lists/*

# Luncher -------------------------------------------------------------------------------------------------------------------------------------|
WORKDIR /app/
COPY /lunch.sh .
RUN ["chmod", "+x", "lunch.sh"]

# BACKEND -------------------------------------------------------------------------------------------------------------------------------------|
WORKDIR /app/backend
COPY backend/package.json .
COPY backend/package-lock.json .
RUN npm install
COPY /backend .


# FRONTEND ------------------------------------------------------------------------------------------------------------------------------------|
WORKDIR /app/frontend
COPY frontend/package.json .
COPY frontend/package-lock.json .
RUN npm install
COPY /frontend .

WORKDIR /

# Expose the Backend
EXPOSE 8000
# Expose the Frontend
EXPOSE 5173

# Start Fontend + Backend
CMD ./app/lunch.sh