import { UserState } from "@/types/main";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: UserState = {
  user_id: "",
  username: "",
  profilePicture: "",
  email: "",
  gender: "",
  first_name: "",
  last_name: "",
  phoneNumber: "",
  address: "",
  userExpertise: "" ,
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
