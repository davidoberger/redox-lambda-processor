import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
import FormData from 'form-data';
import { config } from 'dotenv';
import { RedoxService } from './redox.service';  // Import RedoxService

// Load environment variables
config();

export class SqsService {
  private s3Client: S3Client;
  private redoxService: RedoxService;  // Declare RedoxService

  constructor() {
    this.s3Client = new S3Client({ region: process.env.APP_AWS_REGION });
    this.redoxService = new RedoxService();  // Initialize RedoxService
  }

  async processMessage(message: any) {
    try {
      // Parse the incoming SQS message
      const parsedBody = JSON.parse(message.body);

      // Extract PDF name from the parsedBody (adjust this according to the message structure)
      const pdfName = parsedBody.Meta.Template; // Assuming this is the key you want

      // Fetch the PDF from S3 and convert it to Base64
      const base64Pdf = await this.loadBase64PdfFromS3(pdfName);

      console.log('Fetched base64Pdf:', base64Pdf);
      console.log('Message to send:', parsedBody);

      // Send the Base64-encoded PDF data via POST
      await this.sendDataViaPost(base64Pdf, pdfName);

      console.log('Processed message successfully ');

      // Get FHIR data (for testing, you can hardcode patient details, or get it from `parsedBody`)
      const fhirData = await this.redoxService.getFHIRData('Keva', 'Grddeen', '1995-08-26');  // Use RedoxService to get FHIR data
      console.log('FHIR Data:', fhirData);

    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  async loadBase64PdfFromS3(pdf: string): Promise<string> {
    const s3Key = `redox-base64/${pdf}.txt`; // Update this path if needed

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!, // Ensure the correct bucket name is set in the environment variables
      Key: s3Key,
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
    form.append('field1', message || 'default');

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
