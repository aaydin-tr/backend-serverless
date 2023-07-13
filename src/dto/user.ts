export interface Dto {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export class UserDto implements Dto {
  constructor() {
    this.id = "";
    this.email = "";
    this.createdAt = "";
    this.updatedAt = "";
  }

  createdAt: string;
  updatedAt: string;
  id: string;
  email: string;
}
