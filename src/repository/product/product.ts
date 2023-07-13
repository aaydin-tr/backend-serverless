import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Product from "../../models/product";

class ProductRepository {
  private readonly docClient: DocumentClient;
  private readonly tableName: string;
  constructor(docClient: DocumentClient, tableName: string) {
    this.docClient = docClient;
    this.tableName = tableName;
  }

  async getAllProducts(): Promise<Product[]> {
    const result = await this.docClient
      .scan({
        TableName: this.tableName,
      })
      .promise();

    return result.Items as Product[];
  }

  async getAllProductsByUserID(userId: string): Promise<Product[]> {
    const result = await this.docClient
      .query({
        TableName: this.tableName,
        IndexName: "product_index",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
      })
      .promise();

    return result.Items as Product[];
  }

  async getProduct(productId: string): Promise<Product> {
    const result = await this.docClient
      .query({
        TableName: this.tableName,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: { ":id": productId },
      })
      .promise();

    return result.Items[0] as Product;
  }

  async createProduct(product: Product): Promise<Product> {
    await this.docClient
      .put({
        TableName: this.tableName,
        Item: product,
      })
      .promise();

    return product;
  }

  async updateProduct(
    productId: string,
    userId: string,
    update: Partial<Product>
  ): Promise<Product> {
    const response = await this.docClient
      .update({
        TableName: this.tableName,
        Key: { id: productId, userId },
        UpdateExpression:
          "SET detail = :detail, #n = :productName, updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#n": "name",
        },
        ExpressionAttributeValues: {
          ":detail": update.detail,
          ":productName": update.name,
          ":updatedAt": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      })
      .promise();

    return response.Attributes as Product
  }

  async deleteProduct(productId: string, userId: string) {
    await this.docClient
      .delete({
        TableName: this.tableName,
        Key: {
          id: productId,
          userId: userId,
        },
      })
      .promise();
  }
}

export default ProductRepository;
