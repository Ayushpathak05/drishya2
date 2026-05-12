import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
    name:'realTimeNotification',
    initialState:{
        likeNotification:[], // [1,2,3]
    },
    reducers:{
        setLikeNotification:(state,action)=>{
            if(Array.isArray(action.payload)){
                // DB returned an array of notifications
                state.likeNotification = action.payload;
            }else if(action.payload.type === 'dislike'){
                // Remove notification on dislike
                state.likeNotification = state.likeNotification.filter((item)=> item.userId !== action.payload.userId);
            }else {
                // New socket notification (like, comment, follow, etc)
                state.likeNotification.unshift(action.payload);
            }
        }
    }
});
export const {setLikeNotification} = rtnSlice.actions;
export default rtnSlice.reducer;