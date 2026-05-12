import {createSlice} from "@reduxjs/toolkit"

const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:null,
        suggestedUsers:[],
        userProfile:null,
        selectedUser:null,
        appMode: 'for-you', // 'for-you' | 'growth'
    },
    reducers:{
        // actions
        setAuthUser:(state,action) => {
            state.user = action.payload;
        },
        setSuggestedUsers:(state,action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile:(state,action) => {
            state.userProfile = action.payload;
        },
        setSelectedUser:(state,action) => {
            state.selectedUser = action.payload;
        },
        setAppMode:(state,action) => {
            state.appMode = action.payload;
        }
    }
});
export const {
    setAuthUser, 
    setSuggestedUsers, 
    setUserProfile,
    setSelectedUser,
    setAppMode,
} = authSlice.actions;
export default authSlice.reducer;