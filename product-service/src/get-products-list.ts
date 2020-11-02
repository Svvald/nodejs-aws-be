import { APIGatewayProxyHandler } from 'aws-lambda';
import { CORS_HEADERS } from './cors-headers';
import products from './products-list.json';

export const getProductsList: APIGatewayProxyHandler = async (event) => {
  console.log('getProductsList invokation with event: ', event);

  try {
    const responseData = JSON.stringify(products);
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
  }
}
