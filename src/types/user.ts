export interface User {
  id: string;
  account: string;
  accountName: string;
  roleName: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface Position {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  positionId: string;
  positionName: string;
  image: string;
  name: string;
  address: string;
  birthDate: string;
  phoneNumber: string;
}
