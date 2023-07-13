import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";
import productRepository from "../../../repository/product";
import { Role } from "src/models/user";
import { StatusCodes } from "http-status-codes";
import { S3 } from "aws-sdk";

const deleteProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
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
      { message: "User can only delete their own products" },
      StatusCodes.UNAUTHORIZED
    );
  }

  const s3 = new S3();
  await productRepository.deleteProduct(productId, product.userId);
  if (product?.image) {
    await s3
      .deleteObject({
        Key: product.image,
        Bucket: process.env.BUCKET_NAME,
      })
      .promise();
  }

  return formatJSONResponse({
    message: "successful",
  });
};

export const main = middyfy(deleteProduct, true);
