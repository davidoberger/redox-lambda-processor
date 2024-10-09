import { SqsService } from './sqs.service';

export const handler = async (event: any): Promise<void> => {
  const sqsService = new SqsService();

 // console.log('Event received:', JSON.stringify(event, null, 2));
console.log('Event received');
  if (event.Records && event.Records.length > 0) {
    for (const record of event.Records) {
      await sqsService.processMessage(record);
    }
  }
};
