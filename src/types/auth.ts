export type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = AuthTokens & {
  user: User;
};
