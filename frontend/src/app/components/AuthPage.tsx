import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BASE_URL, useForgotPasswordMutation, useLoginMutation, useRegisterMutation } from "@/store/api";
import { authStatus, toggleLoginDialog } from "@/store/slice/userSlice";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

interface LoginProps {
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
}

interface LoginFormData {
  email: string;
  password: string;
}
interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  agreeTerms: boolean;
}
interface ForgotPasswordFormData {
  email: string;
}

const AuthPage: React.FC<LoginProps> = ({ isLoginOpen, setIsLoginOpen }) => {
  const [currentTab, setCurrentTab] = useState<"login" | "signup" | "forgot">(
    "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [register] = useRegisterMutation();
  const [login] = useLoginMutation();
  const [forgotPassword] = useForgotPasswordMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginError },
  } = useForm<LoginFormData>();
  const {
    register: registerSignUp,
    handleSubmit: handleSignUpSubmit,
    formState: { errors: signUpError },
  } = useForm<SignUpFormData>();
  const {
    register: registerForgotPassword,
    handleSubmit: handleForgotPasswordSubmit,
    formState: { errors: forgotPasswordError },
  } = useForm<ForgotPasswordFormData>();

  const onSubmitSignUp = async (data: SignUpFormData) => {
    setSignupLoading(true);
    
    try {
      const {email, name, password} = data;
      const result = await register({ email, name, password }).unwrap();

      console.log("Registration successful:", result);

      if(result.success) {
        toast.success("Verification email sent");
        dispatch(toggleLoginDialog());
      }
    } catch (error) {
      toast.error("Email already exists");
    }
    finally{
      setSignupLoading(false);
    }
  };

  const onSubmitLogin = async (data: LoginFormData) => {
    setLoginLoading(true);

    try {
      const {email, password} = data;
      const result = await login({ email, password }).unwrap();

      console.log("Login successful:", result);

      if(result.success) {
        toast.success("Login successful");
        dispatch(toggleLoginDialog());
        dispatch(authStatus());
        window.location.reload();
      }
    } catch (error) {
      toast.error("Invalid email or password");
    }
    finally{
      setLoginLoading(false);
    }
  };

    const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    try {
      router.push(`${BASE_URL}/auth/google`);
      dispatch(authStatus());
      dispatch(toggleLoginDialog());
      setTimeout(() => {
        toast.success("Google login successful");
        setIsLoginOpen(false);
      }, 3000);
    } catch (error) {
      toast.error("Invalid email or password");
    }
    finally{
          setGoogleLoading(true);
    }
  };


  const onSubmitForgotPassword = async (data: ForgotPasswordFormData) => {
    setForgotPasswordLoading(true);

    try {
      const result = await forgotPassword(data.email).unwrap();

      if(result.success) {
        toast.success("Password reset email sent");
        setForgotPasswordSuccess(true);
      }
    } catch (error) {
      toast.error("failed to send reset link");
    }
    finally{
      setForgotPasswordLoading(false);
    }
  };
  


  return (
    <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold mb-4">
            Welcome to bookKart
          </DialogTitle>
        </DialogHeader>
        <Tabs
          value={currentTab}
          onValueChange={(value) =>
            setCurrentTab(value as "login" | "signup" | "forgot")
          }
        >
          <TabsList className="grid w-full grid-cols-3 mb-3">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="forgot">Forgot</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLoginSubmit(onSubmitLogin)} className="space-y-4">
                  <div className="relative">
                    <Input
                      {...registerLogin("email", {
                        required: "Email is Required",
                      })}
                      placeholder="Email"
                      type="email"
                      className="pl-10"
                    />
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={20}
                    />
                  </div>
                  {loginError.email && (
                    <p className="text-red-500 text-sm">
                      {loginError.email.message}
                    </p>
                  )}
                  <div className="relative">
                    <Input
                      {...registerLogin("password", {
                        required: "Password is Required",
                      })}
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      className="pl-10"
                    />
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={20}
                    />
                    {showPassword ? (
                      <EyeOff
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                        size={20}
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <Eye
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                        size={20}
                        onClick={() => setShowPassword(true)}
                      />
                    )}
                  </div>
                  {loginError.password && (
                    <p className="text-red-500 text-sm">
                      {loginError.password.message}
                    </p>
                  )}

                  <Button type="submit" className="w-full font-bold">
                    {loginLoading ? (
                      <Loader2 className="animate-spin mr-2" size={20} />
                    ) : (
                      "login"
                    )}
                  </Button>
                </form>
                <div className="flex items-center my-4">
                  <div className="flex-1 h-px bg-gray-300" />
                  <p className="mx-2 text-gray-500 text-sm"> Or </p>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>
                <Button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                  {googleLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Login with Google...
                    </>
                  ) : (
                    <>
                      <Image
                        src="/icons/google.svg"
                        alt="google"
                        width={20}
                        height={20}
                      />
                      Login with Google
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUpSubmit(onSubmitSignUp)} className="space-y-4">
                  <div className="relative">
                    <Input
                      {...registerSignUp("name", {
                        required: "Name is Required",
                      })}
                      placeholder="Name"
                      type="text"
                      className="pl-10"
                    />
                    <User
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={20}
                    />
                  </div>
                  {signUpError.email && (
                    <p className="text-red-500 text-sm">
                      {signUpError.email.message}
                    </p>
                  )}
                  <div className="relative">
                    <Input
                      {...registerSignUp("email", {
                        required: "Email is Required",
                      })}
                      placeholder="Email"
                      type="email"
                      className="pl-10"
                    />
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={20}
                    />
                  </div>
                  {signUpError.email && (
                    <p className="text-red-500 text-sm">
                      {signUpError.email.message}
                    </p>
                  )}
                  <div className="relative">
                    <Input
                      {...registerSignUp("password", {
                        required: "Password is Required",
                      })}
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      className="pl-10"
                    />
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={20}
                    />
                    {showPassword ? (
                      <EyeOff
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                        size={20}
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <Eye
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                        size={20}
                        onClick={() => setShowPassword(true)}
                      />
                    )}
                  </div>
                  {signUpError.password && (
                    <p className="text-red-500 text-sm">
                      {signUpError.password.message}
                    </p>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...registerSignUp("agreeTerms", {
                        required: "you must agree to our terms and conditions",
                      })}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">
                      I agree to the terms & conditions
                    </label>
                  </div>
                  {signUpError.agreeTerms && (
                    <p className="text-red-500 text-sm">
                      {signUpError.agreeTerms.message}
                    </p>
                  )}

                  <Button type="submit" className="w-full font-bold">
                    {signupLoading ? (
                      <Loader2 className="animate-spin mr-2" size={20} />
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="forgot" className="space-y-4">
                {!forgotPasswordSuccess ? (
                  <form onSubmit={handleForgotPasswordSubmit(onSubmitForgotPassword)} className="space-y-4">
                    <div className="relative">
                      <Input
                        {...registerForgotPassword("email", {
                          required: "Email is Required",
                        })}
                        placeholder="Email"
                        type="email"
                        className="pl-10"
                      />
                      <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        size={20}
                      />
                    </div>
                    {forgotPasswordError.email && (
                      <p className="text-red-500 text-sm">
                        {forgotPasswordError.email.message}
                      </p>
                    )}

                    <Button type="submit" className="w-full font-bold">
                      {forgotPasswordLoading ? (
                        <Loader2 className="animate-spin mr-2" size={20} />
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-4"
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <h3 className="text-xl font-semibold text-gray-700">
                      Reset Link Send
                    </h3>
                    <p className="text-gray-500">
                      We've sent a password reset link to your email. Please
                      check your inbox and follow the instructions to reset your
                      password.
                    </p>
                    <Button onClick={() => setForgotPasswordSuccess(false)} className="w-full">Send again</Button>
                  </motion.div>
                )}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        <p className="text-sm text-center mt-2 text-gray-600">
            By clicking "agree", you agree to our {" "}
            <Link href='/terms-of-use' className="text-blue-500 hover:underline">Terms Of Use</Link>, {" "}
            <Link href='privacy-policy' className="text-blue-500 hover:underline">Privacy Policy</Link>
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPage;
