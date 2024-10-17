// CouponService.ts
export class CouponService {
  static getPDF(parsedBody: any) {
    throw new Error('Method not implemented.');
  }
  getPDF(json: any): string {
    // Extract the PDF name based on your logic
    console.log ('QQQQQQQQQQQQQQQQ1',json, json.Order.Medication.Product.Code );
    console.log ('QQQQQQQQQQQQQQQQ2',json.Order.Medication.Product.Code );
  const pdfName = json.Order.Medication.Product.Code; // Modify this logic based on your needs
    // const pdfName = 'file_331';

    return pdfName;
  }
}
