import createDynamoDBClient from "../../db";
import ProductRepository from "./product";

const { PRODUCT_TABLE_NAME } = process.env;

const productRepository = new ProductRepository(createDynamoDBClient(), PRODUCT_TABLE_NAME);

export default productRepository;