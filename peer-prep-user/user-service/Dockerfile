# Use Node.js Alpine image
FROM node:18-alpine

ENV ENV=PROD
ENV DB_CLOUD_URI=mongodb+srv://peer-prep:1EjJPR5eiyIwhIql@peer-prep-cluster0.ftsoh.mongodb.net/?retryWrites=true&w=majority&appName=peer-prep-cluster0
ENV TZ=Asia/Kuala_Lumpur

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies and set timezone
RUN apk add --no-cache tzdata \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    && npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]