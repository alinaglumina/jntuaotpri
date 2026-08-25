import { createSlice } from '@reduxjs/toolkit';

// Redux holds ONLY auth/session state. Server data lives in React Query.
// status: 'loading' (session being restored) | 'authenticated' | 'guest'
const slice = createSlice({
  name: 'auth',
  initialState: { user: null, status: 'loading' },
  reducers: {
    setUser(state, action) { state.user = action.payload; state.status = 'authenticated'; },
    clearUser(state) { state.user = null; state.status = 'guest'; },
    setGuest(state) { state.user = null; state.status = 'guest'; },
  },
});
export const { setUser, clearUser, setGuest } = slice.actions;
export const selectUser = (s) => s.auth.user;
export const selectAuthStatus = (s) => s.auth.status;
export default slice.reducer;
