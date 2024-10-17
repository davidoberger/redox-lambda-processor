// src/redoxVerify-lambda.ts

import { S3Client } from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Create S3 client (same as your existing client)
const s3Client = new S3Client({ region: process.env.APP_AWS_REGION });

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Check if the request is a POST request
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' }),
      };
    }

    // Get the verifyKey from the environment, default to '2&pqTtvL9h@skH4'
    const verifyKey = process.env.verifyKey || '2&pqTtvL9h@skH4';

    // Return the challenge response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challenge: verifyKey,
      }),
    };
  } catch (error) {
    console.error('Error handling request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
