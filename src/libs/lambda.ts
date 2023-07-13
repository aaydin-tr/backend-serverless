import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandlerMiddleware from "./error-handler";
import JWTAuthMiddleware, {
  EncryptionAlgorithms,
} from "middy-middleware-jwt-auth";

export default httpErrorHandlerMiddleware;

export const middyfy = (handler, protectedRoute: boolean = false) => {
  const m = middy(handler)
    .use(middyJsonBodyParser())
    .use(httpErrorHandlerMiddleware());
  if (protectedRoute) {
    m.use(
      JWTAuthMiddleware({
        algorithm: EncryptionAlgorithms.HS256,
        credentialsRequired: true,
        secretOrPublicKey: process.env.JWT_SECRET,
      })
    );
  }

  return m;
};
