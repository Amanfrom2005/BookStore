import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
// Don't always import real storage!
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PURGE, PERSIST, REGISTER } from "redux-persist";
import userReducer from "./slice/userSlice";
import { api } from "./api";

// Dynamically choose storage:
const createNoopStorage = () => ({
  getItem(_key: string) {
    return Promise.resolve(null);
  },
  setItem(_key: string, value: any) {
    return Promise.resolve(value);
  },
  removeItem(_key: string) {
    return Promise.resolve();
  },
});

const isBrowser = typeof window !== "undefined";
const storage = isBrowser
  ? require("redux-persist/lib/storage").default
  : createNoopStorage();

const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['user', 'isEmailVerified', 'isLoggedIn'] // NOTE: use 'whitelist', not 'whiteList'
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    user: persistedUserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PURGE, PERSIST, REGISTER],
      },
    }).concat(api.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
