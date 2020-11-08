import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getProductById } from './get-product-by-id';
import products from './products-list.json';

const mockEventBase: APIGatewayProxyEvent = {
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

const mockEventWithExistingId: APIGatewayProxyEvent = {
  ...mockEventBase,
  pathParameters: {
    productId: '7567ec4b-b10c-48c5-9345-fc73c48a80aa'
  }
};

test('getProductById returns status code 200 when correct id is provided', async () => {
  const result = await getProductById(mockEventWithExistingId, null, null) as APIGatewayProxyResult;
  expect(result.statusCode).toEqual(200);
});

test('getProductById returns corresponding document when correct id is provided', async () => {
  const expectedProduct = products[0];
  const result = await getProductById(mockEventWithExistingId, null, null) as APIGatewayProxyResult;
  expect(result.body).toEqual(expectedProduct);
});

const mockEventWithIncorrectId: APIGatewayProxyEvent = {
  ...mockEventBase,
  pathParameters: {
    productId: '123'
  }
};
const errorMessage = 'No product with provided id has been found';

test('getProductById returns status code 404 when incorrect id is provided', async () => {
  const result = await getProductById(mockEventWithIncorrectId, null, null) as APIGatewayProxyResult;
  expect(result.statusCode).toEqual(404);
});

test('getProductById returns error message when incorrect id is provided', async () => {
  const result = await getProductById(mockEventWithIncorrectId, null, null) as APIGatewayProxyResult;
  expect(result.body).toEqual(errorMessage);
});
