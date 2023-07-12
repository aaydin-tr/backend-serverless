import createDynamoDBClient from "../../db";
import UserRepository from "./user";

const { USER_TABLE_NAME, USER_UNIQUE_TABLE_NAME } = process.env;

const userRepository = new UserRepository(
  createDynamoDBClient(),
  USER_TABLE_NAME,
  USER_UNIQUE_TABLE_NAME
);

export default userRepository;
