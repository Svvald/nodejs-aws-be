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
    'serverless-webpack',
    'serverless-dotenv-plugin'
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
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      PG_HOST: process.env.PG_HOST,
      PG_PORT: process.env.PG_PORT,
      PG_DATABASE: process.env.PG_DATABASE,
      PG_USERNAME: process.env.PG_USERNAME,
      PG_PASSWORD: process.env.PG_PASSWORD,
      SNS_TOPIC_ARN: {
        Ref: 'SNSTopic'
      }
    },

    iamRoleStatements: [{
      Effect: 'Allow',
      Action: 'sns:Publish',
      Resource: [{
        Ref: 'SNSTopic'
      }]
    }]
  },

  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalog-items-queue',
          ReceiveMessageWaitTimeSeconds: 20
        }
      },

      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'create-product-topic'
        }
      },

      SNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'nc@svvald.me',
          Protocol: 'email',
          TopicArn: {
            Ref: 'SNSTopic'
          }
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
