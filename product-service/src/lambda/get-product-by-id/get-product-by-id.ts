import { APIGatewayProxyHandler } from 'aws-lambda';
import products from '../../assets/mock-products-list.json';
import { CORS_HEADERS } from '../../utils/cors-headers';

export const getProductById: APIGatewayProxyHandler = async (event) => {
  console.log('getProductById invokation with event: ', event);

  try {
    const id = event.pathParameters.productId;
    const product = products.find(p => p.id === id);

    if (!product) {
      return {
        statusCode: 404,
        headers: { ...CORS_HEADERS },
        body: 'No product with provided id has been found'
      }
    }

    const responseData = JSON.stringify(product);
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
