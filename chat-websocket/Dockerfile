# Use a Node.js base image
FROM node:18

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the WebSocket server will run on
EXPOSE 8082

# Start the WebSocket server
CMD ["node", "server.js"]
