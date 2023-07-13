import type { AWS } from "@serverless/typescript";

import userLogin from "@functions/user/login";
import userCreate from "@functions/user/create";
import createProduct from "@functions/product/create";
import getProduct from "@functions/product/get";
import getAllProduct from "@functions/product/list";
import deleteProduct from "@functions/product/delete";
import updateProduct from "@functions/product/update";

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
      BUCKET_NAME: "serverless-product-images",
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
              "dynamodb:UpdateItem",
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
          {
            Effect: "Allow",
            Action: ["dynamodb:DescribeTable", "dynamodb:Query"],
            Resource: [
              "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.PRODUCT_TABLE_NAME}/index/*",
            ],
          },
          {
            Effect: "Allow",
            Action: [
              "s3:ListBucket",
              "s3:GetObject",
              "s3:PutObject",
              "s3:DeleteObject",
            ],
            Resource: [
              "arn:aws:s3:::${self:provider.environment.BUCKET_NAME}",
              "arn:aws:s3:::${self:provider.environment.BUCKET_NAME}/*",
            ],
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: {
    userLogin,
    userCreate,
    createProduct,
    getProduct,
    getAllProduct,
    deleteProduct,
    updateProduct,
  },
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
            { AttributeName: "userId", AttributeType: "S" },
          ],
          KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },
            { AttributeName: "userId", KeyType: "RANGE" },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          GlobalSecondaryIndexes: [
            {
              IndexName: "product_index",
              KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
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
