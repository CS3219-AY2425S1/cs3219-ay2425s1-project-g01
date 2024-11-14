# Use the official Node.js image as the base
FROM node:16-alpine

# Define environment variables if needed
ENV PORT=4003
ENV MATCHING_SERVICE_URL=http://localhost:3002
ENV QUESTIONS_SERVICE_URL=http://localhost:8080
ENV AMQP_SERVER=amqps://lguugvwb:UtQY1D0zOoX8s0ZvR4GunuRDk0xv8UuI@octopus.rmq3.cloudamqp.com/lguugvwb

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code into the container
COPY . .

# Expose the port your app runs on
EXPOSE 4003

# Start the application
CMD ["npm", "start"]

# docker build -t peer-prep-collab .
# docker run -p 4003:4003 peer-prep-collab