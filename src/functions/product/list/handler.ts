import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import productRepository from "../../../repository/product";
import userRepository from "../../../repository/user";
import { Dto } from "../../../dto/user";
import Product from "src/models/product";
import { Role } from "src/models/user";

const list: ValidatedEventAPIGatewayProxyEvent<null> = async (event: any) => {
  const { id: userId, role } = event.auth.payload;
  if (!userId || !role) {
    return formatJSONResponse(
      {
        message: "Unauthorized",
      },
      401
    );
  }

  let products: Product[];
  if (role === Role.admin) {
    products = await productRepository.getAllProducts();
  } else {
    products = await productRepository.getAllProductsByUserID(userId);
  }

  const userCache: Map<string, Dto> = new Map();
  const response = await Promise.all(
    products.map(async (product) => {
      let productUser: Dto;
      if (userCache.has(product.userId)) {
        productUser = userCache.get(product.userId);
      } else {
        productUser = await userRepository.getUserById(product.userId);
        userCache.set(product.userId, productUser);
      }

      return {
        ...product,
        user: productUser,
      };
    })
  );

  return formatJSONResponse({
    message: "successful",
    data: response,
  });
};

export const main = middyfy(list, true);
