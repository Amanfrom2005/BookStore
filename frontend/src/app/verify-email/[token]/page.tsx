"use client";

import { Button } from "@/components/ui/button";
import { useVerifyEmailMutation } from "@/store/api";
import { authStatus, setEmailVerified } from "@/store/slice/userSlice";
import { RootState } from "@/store/store";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const page: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const dispatch = useDispatch();
  const [verifyEmail] = useVerifyEmailMutation();
  const isVerifyEmail = useSelector(
    (state: RootState) => state.user.isEmailVerified
  );
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "already_verified" | "failed">("loading");

  useEffect(() => {
    const verify = async () => {
      if (isVerifyEmail) {
        setVerificationStatus("already_verified");
        return;
      }
      try {
        const result = await verifyEmail(token).unwrap();
        if (result.success) {
          dispatch(setEmailVerified(true));
          setVerificationStatus("success");
          dispatch(authStatus());
          toast.success("Email verified successfully!");
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        } else {
          throw new Error(result.message || "Verification failed");
        }
      } catch (error) {
        console.error("Email verification failed. Please try again later.");
      }
    };
    if (token) {
      verify();
    }
  }, [isVerifyEmail, token, verifyEmail, dispatch]);

  return (
    <div className="p-20 flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md w-full"
      >
        {verificationStatus === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-16 w-16 text-blue-500 mb-4 animate-spin" />
            <h2 className="text-2xl text-gray-800 mb-2 font-semibold">
              Verifying your email...
            </h2>
            <p className="text-gray-600">
              Please wait a moment while we verify your email address.
            </p>
          </div>
        )}
        {verificationStatus === "success" && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
             <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl text-gray-800 mb-2 font-semibold">
              Email verified
            </h2>
            <p className="text-gray-600">
              Your email has been verified successfully. you'all be redirecting to homepage shortly
            </p>
          </motion.div>
        )}
        {verificationStatus === "already_verified" && (
           <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
             <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl text-gray-800 mb-2 font-semibold">
              Email Already verified
            </h2>
            <p className="text-gray-600">
              Your email is already verified. you can use our services
            </p>
            <Button onClick={ () => router.push("/")} variant="outline" className="bg-blue-500 hover:bg-blue-600 text-white font-bold mt-4 py-2 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
              Go to homepage
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default page;
