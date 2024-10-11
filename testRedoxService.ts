import { RedoxService } from './src/redox.service';
import { config } from 'dotenv';

// Load environment variables
config();

async function testRedox() {
  try {
    const redoxService = new RedoxService();
    
    // Test the access token retrieval
    const token = await redoxService.getAccessToken();
    console.log('Access Token:', token);

    // Test the FHIR data retrieval (you can use mock data here for testing)
    const fhirData = await redoxService.getFHIRData('John', 'Doe', '1980-01-01');
    console.log('FHIR Data:', fhirData);

  } catch (error) {
    console.error('Error during Redox service test:', error);
  }
}

testRedox();
