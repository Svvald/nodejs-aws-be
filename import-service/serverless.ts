import type { Serverless } from 'serverless/aws';
import { ResponseParameters } from "./src/utils/response-parameters";

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service',
  },

  frameworkVersion: '2',

  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },

  plugins: ['serverless-webpack'],

  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SQS_URL: 'https://sqs.eu-west-1.amazonaws.com/314054664759/catalog-items-queue'
    },
    iamRoleStatements: [{
      Effect: 'Allow',
      Action: 's3:ListBucket',
      Resource: 'arn:aws:s3:::epam-nodejs-aws-app-files'
    }, {
      Effect: 'Allow',
      Action: 's3:*',
      Resource: 'arn:aws:s3:::epam-nodejs-aws-app-files/*'
    }, {
      Effect: 'Allow',
      Action: 'sqs:SendMessage',
      Resource: 'arn:aws:sqs:eu-west-1:314054664759:catalog-items-queue'
    }]
  },

  resources: {
    Resources: {
      GatewayResponseAccessDenied: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: ResponseParameters,
          ResponseType: "ACCESS_DENIED",
          RestApiId: {
            Ref: "ApiGatewayRestApi"
          }
        }
      },
      GatewayResponseUnauthorized: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: ResponseParameters,
          ResponseType: "UNAUTHORIZED",
          RestApiId: {
            Ref: "ApiGatewayRestApi"
          }
        }
      }
    }
  },

  functions: {
    importProductsFile: {
      handler: 'handler.importProductsFile',
      events: [{
        http: {
          method: 'put',
          path: 'import',
          cors: true,
          authorizer: {
            name: 'basicAuthorizer',
            arn: 'arn:aws:lambda:eu-west-1:314054664759:function:authorization-service-dev-basicAuthorizer',
            type: 'token',
            resultTtlInSeconds: 0
          },
          request: {
            parameters: {
              querystrings: {
                name: true
              }
            }
          }
        }
      }]
    },

    importFileParser: {
      handler: 'handler.importFileParser',
      events: [{
        s3: {
          bucket: 'epam-nodejs-aws-app-files',
          event: 's3:ObjectCreated:*',
          rules: [{
            prefix: 'uploaded/',
            suffix: ''
          }],
          existing: true
        }
      }]
    }
  }
}

module.exports = serverlessConfiguration;
