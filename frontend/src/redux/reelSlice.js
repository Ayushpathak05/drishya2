import { createSlice } from "@reduxjs/toolkit";

const reelSlice = createSlice({
    name: 'reel',
    initialState: {
        reels: [],
        selectedReel: null,
    },
    reducers: {
        setReels: (state, action) => {
            state.reels = action.payload;
        },
        setSelectedReel: (state, action) => {
            state.selectedReel = action.payload;
        },
        updateReelLike: (state, action) => {
            const { reelId, userId, liked } = action.payload;
            state.reels = state.reels.map(r => {
                if (r._id === reelId) {
                    return {
                        ...r,
                        likes: liked
                            ? r.likes.filter(id => id !== userId)
                            : [...r.likes, userId]
                    };
                }
                return r;
            });
        },
        addReelComment: (state, action) => {
            const { reelId, comment } = action.payload;
            state.reels = state.reels.map(r =>
                r._id === reelId ? { ...r, comments: [...r.comments, comment] } : r
            );
        },
    }
});

export const { setReels, setSelectedReel, updateReelLike, addReelComment } = reelSlice.actions;
export default reelSlice.reducer;
