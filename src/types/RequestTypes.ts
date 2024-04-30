export interface AcceptMessage {
  acceptMessages: boolean;
}

export interface SendMessage {
  username: string;
  content: string;
}

export interface SignUp {
  username: string;
  email: string;
  password: string;
}

export interface Verify {
    username: string;
    code: string
}