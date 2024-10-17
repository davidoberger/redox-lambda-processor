import * as AWS from 'aws-sdk';

export class CouponService {
  private dynamoDb: AWS.DynamoDB.DocumentClient;

  constructor() {
    // Initialize DynamoDB DocumentClient
    this.dynamoDb = new AWS.DynamoDB.DocumentClient();
  }

  // Method to get PDF name from DynamoDB
  async getPDF(json: any): Promise<string> {
    // Extract the PDF name based on the provided logic
    const pdfName = json.Order.Medication.Product.Code;
   //const pdfName = '104894';
    console.log('Looking up PDF name in PdfCoupons table for:', pdfName);

    // Define the parameters for DynamoDB getItem
    const params = {
      TableName: 'PdfCoupons', // Update with your actual table name
      Key: {
        'coupon_id': pdfName  // Assuming coupon_id is the primary key in PdfCoupons
      }
    };

    try {
      // Query DynamoDB to fetch the coupon record
      const result = await this.dynamoDb.get(params).promise();

      // If the record exists, return the pdf_name from the record
      if (result.Item) {
        console.log('Record found:', result.Item.coupon_id);
        return result.Item.coupon_id || 'No PDF name found';
      } else {
        console.log('No record found for coupon_id:', pdfName);
        return 'No PDF found';
      }
    } catch (error) {
      // Log and handle any errors
      console.error('Error querying DynamoDB:', error);
      throw new Error('Could not fetch PDF name');
    }
  }

  // Static method placeholder (if needed)
  static getPDF(parsedBody: any) {
    throw new Error('Method not implemented.');
  }
}
