import { normalizeHttpResponse } from "@middy/util";

const httpErrorHandlerMiddleware = () => {
  const httpErrorHandlerMiddlewareOnError = async (request) => {
    if (request.response !== undefined) return;

    if (request.error.statusCode && request.error.expose === undefined) {
      request.error.expose = request.error.statusCode < 500;
    }
    
    if (!request.error.statusCode || !request.error.expose) {
      console.log(request?.error)
      request.error = {
        statusCode: 500,
        message: "Something went wrong",
        expose: true,
      };
    }

    if (request.error.expose) {
      normalizeHttpResponse(request);
      const { statusCode, message, headers } = request.error;
      request.response = {
        statusCode,
        body: JSON.stringify({
          message,
          statusCode,
        }),
        headers: {
          ...headers,
          ...request.response.headers,
          "Content-Type": "application/json",
        },
      };
    }
  };
  return {
    onError: httpErrorHandlerMiddlewareOnError,
  };
};
export default httpErrorHandlerMiddleware;
