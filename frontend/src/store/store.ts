import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import storage from "redux-persist/lib/storage";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PURGE,
  PERSIST,
  REGISTER,
} from "redux-persist";
import userReducer from "./slice/userSlice";
import cartReducer from "./slice/cartSlice";
import wishlistReducer from "./slice/wishlistSlice";
import checkoutReducer from "./slice/checkoutSlice";
import { api } from "./api";

const userPersistConfig = { key: "user", storage, whiteList: ["user", "isEmailVerified", "isLoggedIn"]};
const cartPersistConfig = { key: "cart", storage, whiteList: ["items"]};
const wishlistPersistConfig = { key: "wishlist", storage};
const checkoutPersistConfig = { key: "checkout", storage};

const presistedUserReducer = persistReducer(userPersistConfig, userReducer);
const presistedCartReducer = persistReducer(cartPersistConfig, cartReducer);
const presistedWishlistReducer = persistReducer(wishlistPersistConfig, wishlistReducer);
const presistedCheckoutReducer = persistReducer(checkoutPersistConfig, checkoutReducer);

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    user: presistedUserReducer,
    cart: presistedCartReducer,
    wishlist: presistedWishlistReducer,
    checkout: presistedCheckoutReducer
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
