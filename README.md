# Project

This app contains CRUD operations for simulate e-commerce product feature lambda functions. All `/product/*` routes under access control. You need to create user and login with that user before use any product route, after create user use `/user/login` function to get jwt token.

## Installation/deployment instructions

Depending on your preferred package manager, follow the instructions below to deploy your project.

> **Requirements**: NodeJS `lts/fermium (v.14.15.0)`. If you're using [nvm](https://github.com/nvm-sh/nvm), run `nvm use` to ensure you're using the same Node version in local and in your lambda's runtime.

### Using NPM

- Run `npm i` to install the project dependencies
- Run `npx sls deploy` to deploy this stack to AWS

### Using Yarn

- Run `yarn` to install the project dependencies
- Run `yarn sls deploy` to deploy this stack to AWS

## Test the service

- Send a `POST` request to `/user/create` with a payload containing a string property named `email`, `password` and `role` will result in API Gateway returning a `200` HTTP status code with a `token` that allows you to call `/product/*` endpoints


### Remotely

Copy and replace your `url` - found in Serverless `deploy` command output - and `name` parameter in the following `curl` command in your terminal or in Postman to test your newly deployed application.

```
curl --location --request POST 'https://myApiEndpoint/dev/user/create' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "admin@test.com",
    "password": "admin",
    "role": "admin"
}'
```

### Project structure

The project code base is mainly located within the `src` folder. This folder is divided in:

- `functions` - containing code base and configuration for your lambda functions
- `libs` - containing shared code base between your lambdas
- `dt` - containing DynamoDB client connection function
- `dto` - containing DTOs class and mapper
- `model` - containing Models
- `repository` - containing repository class
```
.
├── src
│   ├── functions               # Lambda configuration and source code folder
│   │   ├── user
│   │   │   │── login
│   │   │   │   ├── handler.ts      # `Login` lambda source code
│   │   │   │   ├── index.ts        # `Login` lambda Serverless configuration
│   │   │   │   ├── mock.json       # `Login` lambda input parameter, if any, for local invocation
│   │   │   │   └── schema.ts       # `Login` lambda input event JSON-Schema
│   │   │
│   │   └── index.ts            # Import/export of all lambda configurations
│   │
│   └── libs                    # Lambda shared code
│       └── apiGateway.ts       # API Gateway specific helpers
│       └── handlerResolver.ts  # Sharable library for resolving lambda handlers
│       └── lambda.ts           # Lambda middleware
│
├── package.json
├── serverless.ts               # Serverless service file
├── tsconfig.json               # Typescript compiler configuration
├── tsconfig.paths.json         # Typescript paths
└── webpack.config.js           # Webpack configuration
```

### 3rd party libraries

- [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts) - uses JSON-Schema definitions used by API Gateway for HTTP request validation to statically generate TypeScript types in your lambda's handler code base
- [middy](https://github.com/middyjs/middy) - middleware engine for Node.Js lambda. This template uses [http-json-body-parser](https://github.com/middyjs/middy/tree/master/packages/http-json-body-parser) to convert API Gateway `event.body` property, originally passed as a stringified JSON, to its corresponding parsed object
- [@serverless/typescript](https://github.com/serverless/typescript) - provides up-to-date TypeScript definitions for your `serverless.ts` service file

### Advanced usage

Any tsconfig.json can be used, but if you do, set the environment variable `TS_NODE_CONFIG` for building the application, eg `TS_NODE_CONFIG=./tsconfig.app.json npx serverless webpack`
