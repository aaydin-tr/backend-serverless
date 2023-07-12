export enum Role {
  user = "user",
  admin = "admin",
}

export const DefaultHashRound = 10

interface User {
  id: string;
  email: string;
  password: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export default User;
