import { Role } from "../../../models/user";

export default {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string" },
    role: { enum: Object.values(Role) },
  },
  required: ["email", "password", "role"],
} as const;
