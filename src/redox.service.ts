import axios from 'axios';
import * as jose from 'jose'; // Use jose for JWT creation
import { randomBytes } from 'crypto';
import { URLSearchParams } from 'url';

export class RedoxService {
  private privateKey: string;
  private clientId: string;
  private kid: string;

  constructor() {
    // Initialize the private key, client ID, and Key ID from environment variables
    this.privateKey = process.env.REDOX_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
    YOUR_PRIVATE_KEY_HERE
    -----END PRIVATE KEY-----`;

    this.clientId = process.env.REDOX_CLIENT_ID || 'your-client-id';
    this.kid = process.env.REDOX_KID || 'your-key-id'; // Key ID for the private key
  }

  // Helper method to generate signed JWT for client_assertion
  private async getSignedAssertion(): Promise<string> {
    const iat = Math.floor(Date.now() / 1000); // Current time in seconds
    const privateKey = await jose.importPKCS8(this.privateKey, 'RS384'); // Import PEM private key

    const signedAssertion = await new jose.SignJWT({})
      .setProtectedHeader({
        alg: 'RS384',
        kid: this.kid, // Use Key ID (kid) if required
      })
      .setAudience('https://api.redoxengine.com/v2/auth/token') // Redox token URL
      .setIssuer(this.clientId) // Client ID
      .setSubject(this.clientId) // Client ID
      .setIssuedAt(iat) // Issued time
      .setJti(randomBytes(8).toString('hex')) // Unique ID to prevent replay attacks
      .setExpirationTime('5m') // Token expires in 5 minutes
      .sign(privateKey); // Sign the JWT with the private key

    return signedAssertion;
  }

  // Helper method to get access token from Redox API
  async getAccessToken(): Promise<string> {
    try {
      // Generate the signed JWT (client_assertion)
      const clientAssertion = await this.getSignedAssertion();

      // Prepare the form data using URLSearchParams
      const data = new URLSearchParams();
      data.append('grant_type', 'client_credentials');
      data.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
      data.append('client_assertion', clientAssertion);

      // Axios configuration
      const config = {
        method: 'post',
        url: 'https://api.redoxengine.com/v2/auth/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data.toString(),
      };

      // Make the request to fetch the access token
      const response = await axios.request(config);

      // Return the access token
      return response.data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error);
      throw error;
    }
  }

  // Method to get FHIR data using Redox API
  async searchByName(givenName: string, familyName: string, birthDate: string): Promise<any> {
    try {
      // 1. Get access token from Redox API
      const token = await this.getAccessToken();
      console.log ('$$$$$$$$$$$$$$$ token', token);
      // 2. Use access token to call Redox FHIR API to search for patient
      const fhirApiUrl = 'https://api.redoxengine.com/fhir/R4/redox-fhir-sandbox/Development/Patient/_search';
      const response = await axios.post(fhirApiUrl, null, {
        params: {
          given: givenName,
          family: familyName,
          birthdate: birthDate,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // 3. Return the FHIR data
      return response.data;
    } catch (error) {
      console.error('Error fetching FHIR data:', error);
      throw error;
    }
  }

   async medicationList(patientId: string): Promise<any> {
  try {
    // 1. Get access token from Redox API
    const token = await this.getAccessToken();
    console.log('$$$$$$$$$$$$$$$ token', token);

    // 2. Use access token to call Redox FHIR API to search for patient medications
    const fhirApiUrl = 'https://api.redoxengine.com/fhir/R4/redox-fhir-sandbox/Development/MedicationAdministration/_search';
    
    // 3. Prepare the request body as specified in the documentation
    const requestBody = {
      patient: `Patient/${patientId}`
    };

    // 4. Make the POST request with the correct headers and body
    const response = await axios.post(fhirApiUrl, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json', // Use application/json for the request body
      },
    });

    // 5. Return the FHIR data
    return response.data;
  } catch (error) {
    console.error('Error fetching FHIR data:', error);
    throw error;
  }
}
 async postNote(patientId: string, base64Pdf: string): Promise<any> {
    try {
      // 1. Get access token from Redox API
      const token = await this.getAccessToken();

      // 2. Prepare the DocumentReference resource
      const documentReference = {
        resourceType: 'DocumentReference',
        status: 'current',
        docStatus: 'final',
        type: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '11506-3',
              display: 'Progress note',
            },
          ],
        },
        subject: {
          reference: `Patient/${patientId}`,
        },
        content: [
          {
            attachment: {
              contentType: 'application/pdf',
              data: base64Pdf,
            },
          },
        ],
      };

      // 3. Use access token to call Redox FHIR API to post the note
      const fhirApiUrl =
        'https://api.redoxengine.com/fhir/R4/redox-fhir-sandbox/Development/DocumentReference';
      const response = await axios.post(fhirApiUrl, documentReference, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // 4. Return the response data
      return response.data;
    } catch (error) {
      console.error('Error posting note:', error);
      throw error;
    }
  }
}
