import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

// Create S3 client
const s3Client = new S3Client({ region: process.env.APP_AWS_REGION });

export const handler = async (event: any): Promise<void> => {
  try {
    // Loop through each record in the S3 event
    for (const record of event.Records) {
      // Extract bucket name and object key from the event
      const bucketName = process.env.S3_SOURCE_BUCKET || 'redox-s3'; // Your correct source bucket name here
      const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

      console.log(`Processing PDF from source: ${bucketName}/${objectKey}`);

      // Get the PDF object from S3
      const getObjectParams = {
        Bucket: bucketName,
        Key: objectKey,
      };

      const data = await s3Client.send(new GetObjectCommand(getObjectParams));

      if (!data.Body) {
        throw new Error('No content in the S3 object');
      }

      // Convert PDF to base64
      const base64Pdf = await streamToBase64(data.Body as Readable);

      // Define the destination folder (sibling to the source folder)
      const destKey = objectKey.replace('redox-pdf/', 'redox-base64/').replace('.pdf', '.txt'); // Changing the folder path, keeping same bucket

      // Upload the base64-encoded PDF to the destination path (same bucket, different folder)
      const putParams = {
        Bucket: bucketName, // Same bucket, just different folder
        Key: destKey,
        Body: base64Pdf,
        ContentType: 'text/plain',
      };

      await s3Client.send(new PutObjectCommand(putParams));

      console.log(`Successfully processed and saved base64 PDF to: ${bucketName}/${destKey}`);
    }
  } catch (error) {
    console.error('Error processing PDF: ', error);
    throw error;
  }
};

// Helper function to convert a stream to base64
const streamToBase64 = async (stream: Readable): Promise<string> => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  return buffer.toString('base64');
};
