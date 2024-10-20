import { RedoxService } from './src/redox.service';
import {CouponService} from './src/coupon.service';
import { config } from 'dotenv';

// Load environment variables
config();

async function testRedox() {
  try {
    const redoxService = new RedoxService();
    const couponService = new CouponService();
    // Test the access token retrieval
    const token = await redoxService.getAccessToken();
   // console.log('Access Token:', token);

    // Test the FHIR data retrieval (you can use mock data here for testing)
    // const fhirData = await redoxService.searchByName('John', 'Doe', '1980-01-01');
     // const fhirData = await redoxService.medicationList('81c2f5eb-f99f-40c4-b504-59483e6148d7');
   // console.log('FHIR Data: meds', JSON.stringify(fhirData, null, 2));
const coupon = await couponService.getPDF('104894');
console.log('coupon Data:', coupon);
  } catch (error) {
    console.error('Error during Redox service test:', error);
  }
}

async function testNote() {
  try {
    const redoxService = new RedoxService();

    // Set the patient ID and the base64 string for the PDF
    const patientId = '0000000001';
    const base64Pdf = '0000000001_note_pdf'; // Replace with actual Base64 string for the PDF

    // Post the note
    const response = await redoxService.postNote(patientId, base64Pdf);
    console.log('Note posted successfully:', response);
  } catch (error) {
    console.error('Error posting note:', error);
  }
}

 testRedox();
// testNote();