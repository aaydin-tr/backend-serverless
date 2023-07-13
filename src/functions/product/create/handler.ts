import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { v4 } from "uuid";

import schema from "./schema";
import productRepository from "../../../repository/product";
import Product from "../../../models/product";

const create: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
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

  const { name, detail } = event.body;
  const newProduct: Product = {
    name,
    detail,
    userId,
    id: v4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const res = await productRepository.createProduct(newProduct);

  return formatJSONResponse({
    message: "successful",
    data: res,
  });
};

export const main = middyfy(create, true);
