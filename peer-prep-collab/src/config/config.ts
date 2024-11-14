import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 4003,
  matchingServiceUrl: process.env.MATCHING_SERVICE_URL || 'http://localhost:3002',
  questionsServiceUrl: process.env.QUESTIONS_SERVICE_URL || 'http://localhost:8080',
}