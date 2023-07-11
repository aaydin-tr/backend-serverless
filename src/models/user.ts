interface Product {
  id: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export default Product;
