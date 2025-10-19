# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Expose backend port
EXPOSE 4000

# Command to start backend
CMD ["node", "index.js"]
