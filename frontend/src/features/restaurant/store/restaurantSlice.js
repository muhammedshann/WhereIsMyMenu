import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/api';

export const restaurantSetup = createAsyncThunk(
    "restaurant/restaurantSetup",
    async (restaurantData, thunkAPI) => {
        try {
            const response = await api.post("/restaurant/setup/", restaurantData);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || { detail: "Something went wrong" });
        }
    }
);

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState: {
    data: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
        .addCase(restaurantSetup.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        })
        .addCase(restaurantSetup.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.data = action.payload;
        })
        .addCase(restaurantSetup.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        });
  }
});

export default restaurantSlice.reducer;