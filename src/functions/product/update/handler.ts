import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { parse } from "aws-multipart-parser";
import { StatusCodes } from "http-status-codes";
import { FileData } from "aws-multipart-parser/dist/models";
import { S3 } from "aws-sdk";

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
      { message: "User can only update their own products" },
      StatusCodes.UNAUTHORIZED
    );
  }

  const { name, detail, ...rest } = parse(event, true);
  if (!name || !detail)
    return formatJSONResponse(
      { message: "name and detail fields are required" },
      StatusCodes.BAD_REQUEST
    );

  const file = rest["file"] as FileData;
  let fileKey: string = product.image;

  if (file?.content != null) {
    const s3 = new S3();
    const res = await s3
      .upload({
        Body: file.content,
        Bucket: process.env.BUCKET_NAME,
        Key: product.image,
      })
      .promise();
    fileKey = res.Key;
  }

  const response = await productRepository.updateProduct(
    productId,
    product.userId,
    {
      name: name as string,
      detail: detail as string,
      image: fileKey
    }
  );

  return formatJSONResponse({
    message: "successful",
    data: response,
  });
};

export const main = middyfy(update, true);
