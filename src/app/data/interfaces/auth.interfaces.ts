export interface ILoginPost {
  email: string;
  password: string;
}

export interface IRegisterPost {
  fullName: string;
  email: string;
  password: string;
}

export interface IToken {
  token: string;
}
