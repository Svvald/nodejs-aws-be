import { APIGatewayProxyHandler } from 'aws-lambda';
import products from '../../assets/mock-products-list.json';
import { CORS_HEADERS } from '../../utils/cors-headers';

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
