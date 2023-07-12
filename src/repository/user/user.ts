import { DocumentClient } from "aws-sdk/clients/dynamodb";
import User from "../../models/user";

class UserRepository {
  private readonly docClient: DocumentClient;
  private readonly tableName: string;
  private readonly uniqueTableName: string;

  constructor(docClient: DocumentClient, tableName: string, uniqueTableName: string) {
    this.docClient = docClient;
    this.tableName = tableName;
    this.uniqueTableName = uniqueTableName;
  }

  async getUser(email: string): Promise<User> {
    const result = await this.docClient
      .query({
        TableName: this.tableName,
        IndexName: "user_index",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      })
      .promise();
      
    return result.Items[0] as User;
  }

  async createUser(user: User): Promise<any> {
    await this.docClient
      .transactWrite({
        TransactItems: [
          {
            Put: {
              ConditionExpression: "attribute_not_exists(id)",
              Item: user,
              TableName: this.tableName,
            },
          },
          {
            Put: {
              ConditionExpression: "attribute_not_exists(id)",
              Item: {
                id: "email#" + user.email,
                email: user.email,
              },
              TableName: this.uniqueTableName,
            },
          },
        ],
      })
      .promise();
    const { password: _, ...newUser } = user;
    return newUser;
  }
}

export default UserRepository;
