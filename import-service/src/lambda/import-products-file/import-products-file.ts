import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { BUCKET_NAME, DEFAULT_REGION } from '../../utils/configs';
import { CORS_HEADERS } from '../../utils/cors-headers';
import { HTTP_CODES } from '../../utils/http-codes';

export const importProductsFile: APIGatewayProxyHandler = async (event) => {
  console.log('importProductsFile invokation with event: ', event);

  try {
    const s3 = new S3({ region: DEFAULT_REGION });

    const fileName = event.queryStringParameters.name;
    const signedUrlParams = {
      Bucket: BUCKET_NAME,
      Key: `uploaded/${fileName}`,
      Expires: 60,
      ContentType: 'text/csv'
    }

    const signedUrl = await s3.getSignedUrlPromise('putObject', signedUrlParams);

    return {
      statusCode: HTTP_CODES.OK,
      headers: { ...CORS_HEADERS },
      body: JSON.stringify(signedUrl)
    };
  } catch (error) {
    console.log('An error occured while processing event: ', error);
    const errorData = JSON.stringify({
      message: error
    });

    return {
      statusCode: HTTP_CODES.SERVER_ERROR,
      headers: { ...CORS_HEADERS },
      body: errorData
    }
  }
}