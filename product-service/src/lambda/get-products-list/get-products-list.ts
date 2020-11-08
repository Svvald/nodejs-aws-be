import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';
import { CORS_HEADERS } from '../../utils/cors-headers';
import { DB_OPTIONS } from '../../utils/db-options';

export const getProductsList: APIGatewayProxyHandler = async (event) => {
  console.log('getProductsList invokation with event: ', event);

  const client = new Client(DB_OPTIONS);
  await client.connect();

  try {
    const dmlResult = await client.query(`
      select products.id, count, price, title, description, thumbnail
      from products left join stocks
      on products.id = stocks.product_id
    `);
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
