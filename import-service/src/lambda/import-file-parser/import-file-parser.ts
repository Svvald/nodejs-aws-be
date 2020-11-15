import { S3Handler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { GetObjectRequest } from 'aws-sdk/clients/s3';
import * as csvParser from 'csv-parser';
import { BUCKET_NAME, DEFAULT_REGION } from '../../utils/configs';

export const importFileParser: S3Handler = (event) => {
  console.log('importFileParser invokation with event: ', event);

  try {
    const s3 = new S3({ region: DEFAULT_REGION });

    event.Records.forEach(record => {
      const source = record.s3.object.key;

      const params: GetObjectRequest = {
        Bucket: BUCKET_NAME,
        Key: source
      };

      const fileStream = s3.getObject(params).createReadStream();

      fileStream.pipe(csvParser())
        .on('data', data => {
          console.log(`importFileParser has processed '${source}' data chunk`);
          console.log(data);
        })
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
