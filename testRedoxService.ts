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

testRedox();
