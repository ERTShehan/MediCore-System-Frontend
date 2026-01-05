import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import authReducer from "./slices/authSlice";
import visitReducer from "./slices/visitSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    visit: visitReducer,
  },
});

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks for easier usage
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;