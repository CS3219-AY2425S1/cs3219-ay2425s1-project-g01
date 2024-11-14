# First stage: Build the Go binary
FROM golang:1.23-alpine AS builder

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go.mod and go.sum to the working directory
COPY go.mod go.sum ./

# Download all Go dependencies
RUN go mod download

# Copy the Go source code from the src directory
COPY ./src ./src

# Build the Go app
RUN CGO_ENABLED=0 GOOS=linux go build -o test_run ./src/server.go

# Second stage: Create a minimal image to run the app
FROM alpine:latest

# Set the working directory in the second stage
WORKDIR /root/

# Copy the Go binary from the first stage
COPY --from=builder /app/test_run .

# Uncomment when deploying question service. Comment back before any commit. 
# COPY .env .

ENV PORT=8080

# Expose the application's port
EXPOSE 8080

# Command to run the executable
CMD ["./test_run"]