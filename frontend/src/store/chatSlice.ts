import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ChatDetails =
  | {
      id: string,
      name: string,
    }
  | undefined;

type LastMessage = {
  [groupID: string]: string,
};

type ChatState = {
  chatDetails: ChatDetails,
  lastMessage: LastMessage,
};

const initialState: ChatState = {
  chatDetails: undefined,
  lastMessage: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChatDetails(state, action: PayloadAction<ChatDetails>) {
      state.chatDetails = action.payload;
    },
    setLastMessage(
      state,
      action: PayloadAction<{ groupID: string, lastMessage: string }>
    ) {
      const { groupID, lastMessage } = action.payload;
      state.lastMessage[groupID] = lastMessage;
    },
    clearChatSlice(state) {
      state.chatDetails = undefined;
      state.lastMessage = {};
    },
  },
});

export const { setChatDetails, setLastMessage, clearChatSlice } =
  chatSlice.actions;
export const useChatInfo = (state: { chat: ChatState }) => state.chat;
export default chatSlice.reducer;
