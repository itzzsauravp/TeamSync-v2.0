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

// types/user.ts
export interface User {
  user_id: string;
  username: string;
  email: string;
  profilePicture: string;
}
