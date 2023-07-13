import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";
import productRepository from "../../../repository/product";
import userRepository from "../../../repository/user";
import { Role } from "src/models/user";
import { StatusCodes } from "http-status-codes";

const get: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event: any
) => {
  const { id: userId, role } = event.auth.payload;
  if (!userId || !role) {
    return formatJSONResponse(
      {
        message: "Unauthorized",
      },
      StatusCodes.UNAUTHORIZED
    );
  }
  const productId = event.pathParameters.id;

  if (!productId) {
    return formatJSONResponse(
      {
        message: "Product Id can not be empty",
      },
      StatusCodes.BAD_REQUEST
    );
  }

  const product = await productRepository.getProduct(productId);

  if (product.userId !== userId && role !== Role.admin) {
    return formatJSONResponse(
      { message: "User can only see their own products" },
      StatusCodes.UNAUTHORIZED
    );
  }

  const productUser = await userRepository.getUserById(product.userId);
  return formatJSONResponse({
    message: "successful",
    data: {
      ...product,
      user: productUser,
    },
  });
};

export const main = middyfy(get, true);
