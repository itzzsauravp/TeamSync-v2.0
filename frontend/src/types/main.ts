// types/chat.ts
export interface Message {
  message_id: string;
  sender: string;
  message_content: string;
  sent_at: string;
  group_id: string;
}

export interface Chat {
  group_id: string;
  group_name: string;
  is_direct_message: boolean;
  chat_info: {
    members?: User[];
    otherUser?: User;
  };
  member_count?: number;
}


export interface Group {
  group_id: string;
  group_name: string;
  weight: string;
  createdAt: string;
  updatedAt: string;
  members: Member[];
}

export interface Member {
  id: number;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface User {
  user_id: string;
  email: string;
  gender: string;
  username: string;
  profilePicture: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  address: string | null;
  skillLevel: string | null;
  userBusyUntill: string | null;
  userExpertise: string;
  createdAt: string;
  updatedAt: string;
}

export type UserState = {
  user_id: string;
  username: string;
  profilePicture: string;
  email: string;
  gender: string;
  first_name: string;
  last_name: string;
  phoneNumber: string;
  address: string;
  userExpertise: string;
  isAuthenticated: boolean;
};