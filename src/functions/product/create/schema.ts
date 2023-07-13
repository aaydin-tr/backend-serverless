export default {
  type: "object",
  properties: {
    name: { type: "string" },
    detail: { type: "string" },
  },
  required: ["name", "detail"],
} as const;
