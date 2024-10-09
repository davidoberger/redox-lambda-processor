import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
import FormData from 'form-data';
import { config } from 'dotenv';

// Load environment variables
config();

export class SqsService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({ region: process.env.APP_AWS_REGION });
  }

  async processMessage(message: any) {
    try {
      const testJsonString = '{"key1": "value1", "key2": 1234}'; // Your test JSON string here
      const parsedBody = JSON.parse(testJsonString);
      console.log('Parsed message:', parsedBody);

      const base64Pdf = 'abc'; // Mock base64 for testing

      console.log('base64Pdf:', base64Pdf);
      console.log('Message to send:', parsedBody);

      await this.sendDataViaPost(base64Pdf, parsedBody);

      console.log('Processed message successfully');
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  async loadBase64PdfFromS3(message: any): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: 'path-to-your-pdf.pdf',
    });

    try {
      const data = await this.s3Client.send(command);
      const bodyContents = await data.Body?.transformToString('base64');
      return bodyContents ?? '';
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
