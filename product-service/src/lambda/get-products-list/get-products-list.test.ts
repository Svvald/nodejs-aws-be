import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import products from '../../assets/mock-products-list.json';
import { getProductsList } from './get-products-list';

const mockEvent: APIGatewayProxyEvent = {
  path: '',
  httpMethod: '',
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  stageVariables: {},
  body: '',
  multiValueHeaders: {},
  multiValueQueryStringParameters: {},
  isBase64Encoded: false,
  requestContext: null,
  resource: ''
};

test('getProductsList returns products list', async () => {
  const result  = await getProductsList(mockEvent, null, null) as APIGatewayProxyResult;
  expect(result.body).toEqual(products);
});

test('getProductsList return status code 200', async() => {
  const result  = await getProductsList(mockEvent, null, null) as APIGatewayProxyResult;
  expect(result.statusCode).toEqual(200);
});