import * as AWS from 'aws-sdk';
import axios from 'axios';
import FormData from 'form-data';
import { config } from 'dotenv';

// Load environment variables
config();

export class SqsService {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({ region: process.env.APP_AWS_REGION });
  }

  async processMessage(message: AWS.SQS.Message) {
    try {
      // if (!message.Body) {
      //   console.error('Message body is undefined');
      //   return;
      // }

      console.log('Received message:', message.Body);

      // const parsedBody = JSON.parse(message.Body);
      const testJsonString = '{"key1": "value1", "key2": 1234}'; // Your test JSON string here
const parsedBody = JSON.parse(testJsonString);
      console.log('Parsed message:', parsedBody);

      // Mock base64 PDF content for now to test the function
      // const base64Pdf = await this.loadBase64PdfFromS3(parsedBody);
      const base64Pdf = 'abc';
      // Log the parsed body and base64Pdf to ensure both are processed correctly
      console.log('base64Pdf:', base64Pdf);
      console.log('Message to send:', parsedBody);

      await this.sendDataViaPost(base64Pdf, parsedBody);

      console.log('Processed message successfully');
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  async loadBase64PdfFromS3(message: any): Promise<string> {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: 'path-to-your-pdf.pdf', // Update with the actual key
    };
    try {
      const data = await this.s3.getObject(params).promise();
      return data.Body!.toString('base64');
    } catch (error) {
      console.error('Error fetching PDF from S3:', error);
      throw error;
    }
  }

  async sendDataViaPost(base64Pdf: string, message: any) {
    const apiUrl = process.env.FORM_POST_API_URL!;
    const form = new FormData();
    form.append('pdf', base64Pdf);
    form.append('field1', message.someField || 'default');

    try {
      const response = await axios.post(apiUrl, form, {
        headers: {
          ...form.getHeaders(),
        },
      });

      if (response.status === 200) {
        console.log('Data sent successfully via POST!');
      } else {
        throw new Error(`POST request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending data via POST:', error);
      throw error;
    }
  }
}
