import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service'
  },

  frameworkVersion: '2',

  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },

  plugins: [
    'serverless-webpack'
  ],

  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
    }
  },

  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalog-items-queue',
          ReceiveMessageWaitTimeSeconds: 20
        }
      }
    }
  },

  functions: {
    getProductsList: {
      handler: 'handler.getProductsList',
      events: [{
        http: {
          path: 'products',
          method: 'get',
          cors: true
        }
      }]
    },

    getProductById: {
      handler: 'handler.getProductById',
      events: [{
        http: {
          path: 'products/{productId}',
          method: 'get',
          cors: true,
          request: {
            parameters: {
              paths: {
                productId: true
              }
            }
          }
        }
      }]
    },

    createProduct: {
      handler: 'handler.createProduct',
      events: [{
        http: {
          path: 'products',
          method: 'post',
          cors: true
        }
      }]
    },

    catalogBatchProcess: {
      handler: 'handler.catalogBatchProcess',
      events: [{
        sqs: {
          batchSize: 5,
          arn: {
            'Fn::GetAtt': ['SQSQueue', 'Arn']
          }
        }
      }]
    }
  }
}

module.exports = serverlessConfiguration;
