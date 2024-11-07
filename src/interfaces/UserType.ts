export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface UserType {
  id: number;
  fullname: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  longitude: string;
  latitude: string;
  address: string;
  profile_image: string;
  createdAt: Date;
  updatedAt: Date;
}
