import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
import FormData from 'form-data';
import { config } from 'dotenv';
import { RedoxService } from './redox.service';  // Import RedoxService
import { CouponService } from './coupon.service';  // Import CouponService
// Load environment variables
config();

export class SqsService {
  private s3Client: S3Client;
  private redoxService: RedoxService;  // Declare RedoxService
  couponService: CouponService;

  constructor() {
    this.s3Client = new S3Client({ region: process.env.APP_AWS_REGION });
    this.redoxService = new RedoxService();  // Initialize RedoxService
    this.couponService = new CouponService(); 
  }

  async processMessage(message: any) {
    try {
      // Parse the incoming SQS message
      const parsedBody = JSON.parse(message.body);

      // Extract PDF name from the parsedBody (adjust this according to the message structure)
          // Use the CouponService to get the PDF name
      const pdfName = this.couponService.getPDF(parsedBody);  // Call getPDF method
      // Fetch the PDF from S3 and convert it to Base64
      const base64Pdf = await this.loadBase64PdfFromS3(pdfName);

      console.log('Fetched base64Pdf:', base64Pdf);
      console.log('Message to send:', parsedBody);

      // Send the Base64-encoded PDF data via POST
      await this.sendDataViaPost(base64Pdf, pdfName);

      console.log('Processed message successfully ');

      // Get FHIR data (for testing, you can hardcode patient details, or get it from `parsedBody`)
      const patientData = await this.redoxService.searchByName('Keva', 'Grddeen', '1995-08-26');  // Use RedoxService to get FHIR data
      console.log('FHIR Patient Patient Data:', patientData);
      const medicationList =  await this.redoxService.medicationList('81c2f5eb-f99f-40c4-b504-59483e6148d7'); 
       console.log('FHIR Medications Data:', medicationList);
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
    form.append('pdf', base64Pdf.slice(0, 1000));
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
