import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";
import productRepository from "../../../repository/product";
import { Role } from "src/models/user";

const update: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event: any
) => {
  const { id: userId, role } = event.auth.payload;
  if (!userId || !role) {
    return formatJSONResponse(
      {
        message: "Unauthorized",
      },
      401
    );
  }
  const productId = event.pathParameters.id;

  if (!productId) {
    return formatJSONResponse(
      {
        message: "Product Id can not be empty",
      },
      404
    );
  }

  const product = await productRepository.getProduct(productId);
  if (product.userId !== userId && role !== Role.admin) {
    return formatJSONResponse(
      { message: "User can only update their own products" },
      401
    );
  }

  const { name, detail } = event.body;

  const response = await productRepository.updateProduct(
    productId,
    product.userId,
    {
      name,
      detail,
    }
  );

  return formatJSONResponse({
    message: "successful",
    data: response
  });
};

export const main = middyfy(update, true);
