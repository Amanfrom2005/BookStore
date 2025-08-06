// frontend/src/store/slice/userSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UserState {
    user: any | null;
    isEmailVerified: boolean;
    isLoginDialogOpen: boolean;
    isLoggedIn: boolean;
}

const initialState: UserState = {
    user: null,
    isEmailVerified: false,
    isLoginDialogOpen: false,
    isLoggedIn: false,
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers:{
        setUser: (state, action:PayloadAction<any>) => {
            state.user = action.payload;
        },
        setEmailVerified: (state, action:PayloadAction<boolean>) => {
            state.isEmailVerified = action.payload;
        },
        logOut: (state) => {
            state.user = null;
            state.isEmailVerified = false;
            state.isLoggedIn = false;
        },
        toggleLoginDialog: (state) => {
            state.isLoginDialogOpen = !state.isLoginDialogOpen;
        },
        authStatus: (state) => {
            state.isLoggedIn = true;
        }
    }
});

export const { setUser, setEmailVerified, logOut, toggleLoginDialog, authStatus } = userSlice.actions;
export default userSlice.reducer;