import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { compareSync } from "bcryptjs";

import schema from "./schema";
import userRepository from "../../../repository/user";
import { sign } from "jsonwebtoken";

const login: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { password, email } = event.body;
  const user = await userRepository.getUser(email);

  if (!user) throw new Error("User not found");
  if (!compareSync(password, user.password)) throw new Error("User not found");

  const token = sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
    }
  );

  return formatJSONResponse({
    message: "successful",
    data: { token },
  });
};

export const main = middyfy(login);
