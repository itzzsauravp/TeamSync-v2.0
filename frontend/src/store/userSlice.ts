import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserState = {
  user_id: string;
  username: string;
  profilePicture: string;
  email: string;
  gender: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  isAuthenticated: boolean;
};

const initialState: UserState = {
  user_id: "",
  username: "",
  profilePicture: "",
  email: "",
  gender: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  address: "",
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInfo(state, action: PayloadAction<Partial<UserState>>) {
      return {
        ...state,
        ...action.payload,
      };
    },
    clearUserInfo() {
      return initialState;
    },
  },
});

export const { setUserInfo, clearUserInfo } = userSlice.actions;
export const selectUser = (state: { user: UserState }) => state.user;
export default userSlice.reducer;
