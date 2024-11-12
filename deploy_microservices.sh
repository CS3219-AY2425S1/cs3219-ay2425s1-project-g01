#!/bin/bash

echo "------------------------------------------------------------------------------"
echo "Building and deploying peer-prep-question..."
docker build --platform linux/amd64 -t gcr.io/g01-peer-prep/peer-prep-question ./peer-prep-be
docker tag gcr.io/g01-peer-prep/peer-prep-question:latest gcr.io/g01-peer-prep/peer-prep-question:latest
docker push gcr.io/g01-peer-prep/peer-prep-question:latest
gcloud run deploy peer-prep-question \
  --image gcr.io/g01-peer-prep/peer-prep-question:latest \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars "DB_URL=mongodb+srv://peer-prep:1EjJPR5eiyIwhIql@peer-prep-cluster0.ftsoh.mongodb.net/?retryWrites=true&w=majority&appName=peer-prep-cluster0"
echo "peer-prep-question deployed successfully."
echo "------------------------------------------------------------------------------"

echo "------------------------------------------------------------------------------"
echo "Building and deploying peer-prep-user..."
docker build --platform linux/amd64 -t gcr.io/g01-peer-prep/peer-prep-user ./peer-prep-user/user-service
docker tag gcr.io/g01-peer-prep/peer-prep-user:latest gcr.io/g01-peer-prep/peer-prep-user:latest
docker push gcr.io/g01-peer-prep/peer-prep-user:latest
gcloud run deploy peer-prep-user \
  --image gcr.io/g01-peer-prep/peer-prep-user:latest \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars "ENV=PROD,DB_CLOUD_URI=mongodb+srv://peer-prep:1EjJPR5eiyIwhIql@peer-prep-cluster0.ftsoh.mongodb.net/?retryWrites=true&w=majority&appName=peer-prep-cluster0,JWT_SECRET=you-can-replace-this-with-your-own-secret"
echo "peer-prep-user deployed successfully."
echo "------------------------------------------------------------------------------"

echo "------------------------------------------------------------------------------"
echo "Building and deploying peer-prep-matching..."
docker build --platform linux/amd64 -t gcr.io/g01-peer-prep/rabbitmq ./message_queue
docker tag gcr.io/g01-peer-prep/rabbitmq:latest gcr.io/g01-peer-prep/rabbitmq:latest
docker push gcr.io/g01-peer-prep/rabbitmq:latest
gcloud run deploy peer-prep-matching \
  --image gcr.io/g01-peer-prep/peer-prep-matching:latest \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars "AMQP_SERVER=amqps://lguugvwb:UtQY1D0zOoX8s0ZvR4GunuRDk0xv8UuI@octopus.rmq3.cloudamqp.com/lguugvwb,MONGODB_URI=mongodb+srv://peer-prep:1EjJPR5eiyIwhIql@peer-prep-cluster0.ftsoh.mongodb.net/?retryWrites=true&w=majority&appName=peer-prep-cluster0"
echo "peer-prep-matching deployed successfully."
echo "------------------------------------------------------------------------------"

echo "------------------------------------------------------------------------------"
echo "Building and deploying peer-prep-collab..."
docker build --platform linux/amd64 -t gcr.io/g01-peer-prep/peer-prep-collab ./peer-prep-collab
docker tag gcr.io/g01-peer-prep/peer-prep-collab:latest gcr.io/g01-peer-prep/peer-prep-collab:latest
docker push gcr.io/g01-peer-prep/peer-prep-collab:latest
gcloud run deploy peer-prep-collab \
  --image gcr.io/g01-peer-prep/peer-prep-collab:latest \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars "AMQP_SERVER=amqps://lguugvwb:UtQY1D0zOoX8s0ZvR4GunuRDk0xv8UuI@octopus.rmq3.cloudamqp.com/lguugvwb,
  MATCHING_SERVICE_URL=https://peer-prep-matching-1093398872288.asia-southeast1.run.app,
  QUESTIONS_SERVICE_URL=https://peer-prep-question-1093398872288.asia-southeast1.run.app, 
  DB_CLOUD_URI=mongodb+srv://peer-prep:1EjJPR5eiyIwhIql@peer-prep-cluster0.ftsoh.mongodb.net/?retryWrites=true&w=majority&appName=peer-prep-cluster0"
echo "peer-prep-collab deployed successfully."
echo "------------------------------------------------------------------------------"

echo "------------------------------------------------------------------------------"
echo "Building and deploying collab-websocket..."
docker build --platform linux/amd64 -t gcr.io/g01-peer-prep/collab-websocket ./code-websocket
docker tag gcr.io/g01-peer-prep/collab-websocket:latest gcr.io/g01-peer-prep/collab-websocket:latest
docker push gcr.io/g01-peer-prep/collab-websocket:latest
gcloud run deploy collab-websocket \
  --image gcr.io/g01-peer-prep/collab-websocket:latest \
  --region asia-southeast1 \
  --allow-unauthenticated
echo "collab-websocket deployed successfully."
echo "------------------------------------------------------------------------------"

echo "------------------------------------------------------------------------------"
echo "Building and deploying chat-websocket..."
docker build --platform linux/amd64 -t gcr.io/g01-peer-prep/chat-websocket ./chat-websocket
docker tag gcr.io/g01-peer-prep/chat-websocket:latest gcr.io/g01-peer-prep/chat-websocket:latest
docker push gcr.io/g01-peer-prep/chat-websocket:latest
gcloud run deploy chat-websocket \
  --image gcr.io/g01-peer-prep/chat-websocket:latest \
  --region asia-southeast1 \
  --allow-unauthenticated
echo "chat-websocket deployed successfully."  
echo "------------------------------------------------------------------------------"

echo "------------------------------------------------------------------------------"
echo "Building and deploying match-websocket"
docker build --platform linux/amd64 -t gcr.io/g01-peer-prep/match-websocket ./match-websocket
docker tag gcr.io/g01-peer-prep/match-websocket:latest gcr.io/g01-peer-prep/match-websocket:latest
docker push gcr.io/g01-peer-prep/match-websocket:latest
gcloud run deploy match-websocket \
  --image gcr.io/g01-peer-prep/match-websocket:latest \
  --region asia-southeast1 \
  --allow-unauthenticated
echo "match-websocket deployed successfully."
echo "------------------------------------------------------------------------------"

echo "------------------------------------------------------------------------------"
echo "Building and dploying peer-prep-gateway"
docker build --platform linux/amd64 -t gcr.io/g01-peer-prep/peer-prep-gateway -f ./peer-prep-gateway/Dockerfile .
docker tag gcr.io/g01-peer-prep/peer-prep-gateway:latest gcr.io/g01-peer-prep/peer-prep-gateway:latest
docker push gcr.io/g01-peer-prep/peer-prep-gateway:latest
gcloud run deploy peer-prep-gateway \
  --image gcr.io/g01-peer-prep/peer-prep-gateway:latest \
  --region asia-southeast1 \
  --allow-unauthenticated 
echo "peer-prep-gateway deployed successfully."
echo "------------------------------------------------------------------------------"

echo "All microservices have been deployed, check for errors."

# Easy access to the deployed services:
# Question Service: https://peer-prep-question-1093398872288.asia-southeast1.run.app
# User Service: https://peer-prep-user-1093398872288.asia-southeast1.run.app
# Matching Service: https://peer-prep-matching-1093398872288.asia-southeast1.run.app
# Collaboration Service: https://peer-prep-collab-1093398872288.asia-southeast1.run.app
# WebSocket Service: https://collab-websocket-1093398872288.asia-southeast1.run.app
# Gateway Service: https://peer-prep-gateway-1093398872288.asia-southeast1.run.app
# Chat WebSocket Service: https://chat-websocket-1093398872288.asia-southeast1.run.app