import { APIGatewayProxyHandler } from 'aws-lambda';
import products from './products-list.json';

export const getProductById: APIGatewayProxyHandler = async (event) => {
  console.log('getProductById invokation with event: ', event);

  const id = event.pathParameters.productId;
  const product = products.find(p => p.id === id);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(product)
  }
}
