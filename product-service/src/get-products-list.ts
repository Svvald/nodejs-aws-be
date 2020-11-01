import { APIGatewayProxyHandler } from 'aws-lambda';
import products from './products-list.json';

export const getProductsList: APIGatewayProxyHandler = async (event) => {
  console.log('getProductsList invokation with event: ', event);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(products)
  }
}
