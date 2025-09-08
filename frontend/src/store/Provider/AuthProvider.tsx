import React, { useEffect, useState } from "react";
import { useVerifyAuthMutation } from "../api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { logOut, setEmailVerified, setUser } from "../slice/userSlice";
import BookLoader from "@/lib/BookLoader";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const [verifyAuth, { isLoading }] = useVerifyAuthMutation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await verifyAuth({}).unwrap();
        if (response.success) {
          dispatch(setUser(response.data));
          dispatch(setEmailVerified(response.data.isVerified));
        } else {
          dispatch(logOut());
        }
      } catch (error) {
        dispatch(logOut());
        console.log("Error verifying auth:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    if (!user && isLoggedIn) {
      checkAuth();
    } else {
      setIsCheckingAuth(false);
    }
  }, [user, verifyAuth, dispatch]);

  if (isCheckingAuth || isLoading) {
    return <BookLoader />;
  }

  return <>{children}</>;
}
