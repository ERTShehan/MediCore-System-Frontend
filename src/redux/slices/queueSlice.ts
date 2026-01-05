import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getQueueStatus } from '../../services/visit';

interface VisitData {
  _id: string;
  patientName: string;
  age: number;
  phone: string;
  appointmentNumber: number;
  status?: 'pending' | 'in_progress' | 'completed';
}

interface QueueState {
  currentPatient: VisitData | null;
  completedList: VisitData[];
  totalToday: number;
  loading: boolean;
}

const initialState: QueueState = {
  currentPatient: null,
  completedList: [],
  totalToday: 0,
  loading: false,
};

// Async Thunk to fetch queue status
export const fetchQueue = createAsyncThunk(
  'queue/fetchStatus',
  async () => {
    const response = await getQueueStatus();
    return response;
  }
);

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQueue.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPatient = action.payload.currentPatient;
        state.completedList = action.payload.completedList;
        state.totalToday = action.payload.totalToday || 0;
      })
      .addCase(fetchQueue.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default queueSlice.reducer;