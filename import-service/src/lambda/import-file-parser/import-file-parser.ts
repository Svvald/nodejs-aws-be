import { S3Handler } from 'aws-lambda';
import { S3, SQS } from 'aws-sdk';
import { GetObjectRequest } from 'aws-sdk/clients/s3';
import * as csvParser from 'csv-parser';
import { Transform } from 'stream';
import { BUCKET_NAME, DEFAULT_REGION } from '../../utils/configs';

class SQSStream extends Transform {
  private sqs: SQS;

  constructor(sqs: SQS) {
    super({ writableObjectMode: true });
    this.sqs = sqs;
  }

  _transform(chunk: any, _encoding: string, callback: (error?: Error, data?: any) => void): void {
    this.sqs.sendMessage({
      QueueUrl: process.env.SQS_URL,
      MessageBody: JSON.stringify(chunk)
    }, err => {
      if (err) {
        return callback(err);
      }

      console.log(`${chunk.title} is sent to SQS queue`);

      return callback();
    });
  }
}

export const importFileParser: S3Handler = (event) => {
  console.log('importFileParser invokation with event: ', event);

  try {
    const s3 = new S3({ region: DEFAULT_REGION });
    const sqs = new SQS({ region: DEFAULT_REGION });

    event.Records.forEach(record => {
      const source = record.s3.object.key;

      const params: GetObjectRequest = {
        Bucket: BUCKET_NAME,
        Key: source
      };

      const fileStream = s3.getObject(params).createReadStream();
      const csvStream = csvParser({
        mapValues: ({ value }) => {
          return isNaN(value) ? value : Number(value)
        }
      });
      const sqsStream = new SQSStream(sqs);

      s3.getObject(params).createReadStream()
        .pipe(csvStream)
        .on('error', error => {
          throw new Error(error.message);
        })
        .pipe(sqsStream)
        .on('error', error => {
          throw new Error(error.message);
        })
        .on('end', async () => {
          await s3.copyObject({
            Bucket: BUCKET_NAME,
            CopySource: `${BUCKET_NAME}/${source}`,
            Key: source.replace('uploaded', 'parsed')
          }).promise();

          console.log(`importFileParser moved parsed object ${source} to 'parsed' folder`);

          await s3.deleteObject({
            Bucket: BUCKET_NAME,
            Key: source
          }).promise();

          console.log(`importFileParser deleted parsed object ${source}`);
        });
    });
  } catch (error) {
    console.log('An error occured while processing event: ', error);
  }
}
