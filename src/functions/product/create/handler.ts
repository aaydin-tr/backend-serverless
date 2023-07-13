import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { v4 } from "uuid";
import { parse } from "aws-multipart-parser";
import { StatusCodes } from "http-status-codes";

import schema from "./schema";
import productRepository from "../../../repository/product";
import Product from "../../../models/product";
import { FileData } from "aws-multipart-parser/dist/models";
import { S3 } from "aws-sdk";

const create: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
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

  const { name, detail, ...rest } = parse(event, true);
  if (!name || !detail)
    return formatJSONResponse(
      { message: "name and detail fields are required" },
      StatusCodes.BAD_REQUEST
    );

  const file = rest["file"] as FileData;
  const id = v4();
  let fileKey: string = "";

  if (file?.content != null) {
    const s3 = new S3();
    const res = await s3
      .upload({
        Body: file.content,
        Bucket: process.env.BUCKET_NAME,
        Key: id,
      })
      .promise();
    fileKey = res.Key;
  }

  const newProduct: Product = {
    name: name as string,
    detail: detail as string,
    userId,
    id: v4(),
    image: fileKey,
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
