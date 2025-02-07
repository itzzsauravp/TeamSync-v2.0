import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ChatDetails = {
  group_id: string;
  group_name: string;
  // …other properties as needed
} | null;

type LastMessage = {
  [groupID: string]: any; // Here, you store the last message object.
};

interface ChatState {
  chatDetails: ChatDetails;
  lastMessage: LastMessage;
}

const initialState: ChatState = {
  chatDetails: null,
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
      action: PayloadAction<{ groupID: string; lastMessage: any }>
    ) {
      const { groupID, lastMessage } = action.payload;
      state.lastMessage[groupID] = lastMessage;
    },
    clearChatSlice(state) {
      state.chatDetails = null;
      state.lastMessage = {};
    },
  },
});

export const { setChatDetails, setLastMessage, clearChatSlice } =
  chatSlice.actions;
export default chatSlice.reducer;
