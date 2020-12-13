import {
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";

const generatePolicy = (principalId, resource, effect) => ({
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }
    ]
  }
})

export const basicAuthorizer: (event: APIGatewayTokenAuthorizerEvent, _context, cb) => Promise<void> = async (
  event: APIGatewayTokenAuthorizerEvent,
  _context,
  cb
) => {
  console.log('basicAuthorizer invocation with event: ', event);

  if (event.type !== 'TOKEN') {
    cb('Unauthorized');
  }

  try {
    const authToken = event.authorizationToken;
    const buff = Buffer.from(authToken, 'base64');
    const plainCreds = buff.toString('utf-8').split(':');
    const [username, password] = plainCreds;

    console.log('username: ', username, ' - password: ', password);

    const effect = process.env[username] && process.env[username] === password ? 'Allow' : 'Deny';

    const policy = generatePolicy(effect, event.methodArn, effect);

    cb(null, policy);
  } catch (e) {
    cb(`Unauthorized: ${e.message}`);
  }
};
