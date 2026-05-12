import { createSlice } from "@reduxjs/toolkit";

const callSlice = createSlice({
    name: "call",
    initialState: {
        isReceivingCall: false,
        callerSignal: null,
        caller: null, // {id, name, profilePicture}
        isCalling: false,
        callAccepted: false,
        callEnded: false,
        remoteUser: null, // User we are currently calling/talking to
    },
    reducers: {
        setIncomingCall: (state, action) => {
            state.isReceivingCall = true;
            state.caller = action.payload.from;
            state.callerSignal = action.payload.signal;
        },
        acceptCall: (state) => {
            state.isReceivingCall = false;
            state.callAccepted = true;
            state.remoteUser = state.caller;
        },
        initiateCall: (state, action) => {
            state.isCalling = true;
            state.remoteUser = action.payload.remoteUser;
        },
        setCallAccepted: (state) => {
            state.callAccepted = true;
        },
        endCall: (state) => {
            state.isReceivingCall = false;
            state.callerSignal = null;
            state.caller = null;
            state.isCalling = false;
            state.callAccepted = false;
            state.callEnded = true;
            state.remoteUser = null;
        },
        resetCall: (state) => {
            state.callEnded = false;
        }
    }
});

export const { setIncomingCall, acceptCall, initiateCall, setCallAccepted, endCall, resetCall } = callSlice.actions;
export default callSlice.reducer;
