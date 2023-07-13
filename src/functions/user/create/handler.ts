import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { v4 } from "uuid";
import { hash } from "bcryptjs";

import schema from "./schema";
import userRepository from "../../../repository/user";
import User, { DefaultHashRound } from "../../../models/user";

const create: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { password, email, role } = event.body;
  const passwordHash = await hash(password, DefaultHashRound);

  const user: User = {
    email,
    role,
    id: v4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    password: passwordHash,
  };
  const response = await userRepository.createUser(user);

  return formatJSONResponse({
    message: "successful",
    data: response,
  });
};

export const main = middyfy(create);
