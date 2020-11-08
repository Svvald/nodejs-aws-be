import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';
import { CORS_HEADERS } from '../../utils/cors-headers';
import { DB_OPTIONS } from '../../utils/db-options';

export const getProductById: APIGatewayProxyHandler = async (event) => {
  console.log('getProductById invokation with event: ', event);

  const client = new Client(DB_OPTIONS);
  await client.connect();

  try {
    const id = event.pathParameters.productId;
    const dmlResult = await client.query(`
      select * from products
      where id = $1
    `, [id]);

    if (!dmlResult.rowCount) {
      return {
        statusCode: 404,
        headers: { ...CORS_HEADERS },
        body: 'No product with provided id has been found'
      }
    }

    const responseData = JSON.stringify(dmlResult.rows);
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS },
      body: responseData
    }
  } catch (error) {
    const errorData = JSON.stringify(error);
    console.log('An error occured while processing event: ', errorData);

    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS },
      body: errorData
    }
  } finally {
    client.end();
  }
}
