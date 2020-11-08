import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';
import { CORS_HEADERS } from '../../utils/cors-headers';
import { DB_OPTIONS } from '../../utils/db-options';
import { HTTP_CODES } from '../../utils/http-codes';

export const createProduct: APIGatewayProxyHandler = async (event) => {
  console.log('createProduct invokation with event: ', event);

  const client = new Client(DB_OPTIONS);
  await client.connect();

  try {
    const body = JSON.parse(event.body);
    const { title, description, price, thumbnail } = body;

    // Title is the only field that has NOT NULL constraint in DB and has to be validated
    if (!title) {
      return {
        statusCode: HTTP_CODES.CLIENT_ERROR,
        headers: { ...CORS_HEADERS },
        body: `Field 'title' is obligatory and missing in a request payload`
      }
    }

    const dmlResult = await client.query(`
      insert into products(title, description, price, thumbnail)
      values ($1, $2, $3, $4)
      returning *
    `, [title, description, price, thumbnail]);

    const responseData = JSON.stringify(dmlResult.rows);
    return {
      statusCode: HTTP_CODES.CREATED,
      headers: { ...CORS_HEADERS },
      body: responseData
    }
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
  } finally {
    client.end();
  }
}
