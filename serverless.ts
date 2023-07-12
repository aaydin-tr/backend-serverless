import type { AWS } from "@serverless/typescript";

import login from "@functions/user/login";
import create from "@functions/user/create";

const serverlessConfiguration: AWS = {
  service: "backend",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    region: "us-east-1",
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      PRODUCT_TABLE_NAME: "products",
      USER_TABLE_NAME: "users",
      USER_UNIQUE_TABLE_NAME: "users_unique",
      JWT_SECRET: "PO4hMznhKDwJrMkkmv10I2hJvBjRGxl22Z",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:DescribeTable",
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:DeleteItem",
            ],
            Resource: [
              "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.PRODUCT_TABLE_NAME}",
            ],
          },
          {
            Effect: "Allow",
            Action: [
              "dynamodb:DescribeTable",
              "dynamodb:Query",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
            ],
            Resource: [
              "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.USER_TABLE_NAME}",
            ],
          },
          {
            Effect: "Allow",
            Action: [
              "dynamodb:DescribeTable",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
            ],
            Resource: [
              "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.USER_UNIQUE_TABLE_NAME}",
            ],
          },
          {
            Effect: "Allow",
            Action: ["dynamodb:DescribeTable", "dynamodb:Query"],
            Resource: [
              "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.USER_TABLE_NAME}/index/*",
            ],
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: { login, create },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      ProductTable: {
        Type: "AWS::DynamoDB::Table",
        DeletionPolicy: "Delete",
        Properties: {
          TableName: "${self:provider.environment.PRODUCT_TABLE_NAME}",
          AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "user_id", AttributeType: "S" },
          ],
          KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },
            { AttributeName: "user_id", KeyType: "RANGE" },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          GlobalSecondaryIndexes: [
            {
              IndexName: "product_index",
              KeySchema: [{ AttributeName: "user_id", KeyType: "HASH" }],
              Projection: {
                ProjectionType: "ALL",
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
              },
            },
          ],
        },
      },
      UserTable: {
        Type: "AWS::DynamoDB::Table",
        DeletionPolicy: "Delete",
        Properties: {
          TableName: "${self:provider.environment.USER_TABLE_NAME}",
          AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "email", AttributeType: "S" },
          ],
          KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },
            { AttributeName: "email", KeyType: "RANGE" },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          GlobalSecondaryIndexes: [
            {
              IndexName: "user_index",
              KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
              Projection: {
                ProjectionType: "ALL",
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
              },
            },
          ],
        },
      },
      UserUniqueTable: {
        Type: "AWS::DynamoDB::Table",
        DeletionPolicy: "Delete",
        Properties: {
          TableName: "${self:provider.environment.USER_UNIQUE_TABLE_NAME}",
          AttributeDefinitions: [
            { AttributeName: "email", AttributeType: "S" },
          ],
          KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
