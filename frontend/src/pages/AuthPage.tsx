import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { login, register } from "@/api/authApi";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LoginCredentials {
  username: string;
  password: string;
}

interface SignUpCredentials {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  gender: string;
  password: string;
  confirm_password: string;
}

const LoginForm = () => {
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleLoginSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(loginCredentials);
      const { token } = data;
      if (!token) {
        console.error("Token was not found in the response", data);
        toast.error("Login failed: Token not received.");
        return;
      }
      localStorage.setItem("token", token);
      console.log("Token saved to localStorage");
      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (err) {
      console.error("Error Occurred", err);
      toast.error("Sorry!! The credentials mismatch");
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10 relative">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleLoginSubmission}>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={loginCredentials.username}
              onChange={(e) =>
                setLoginCredentials({
                  ...loginCredentials,
                  username: e.target.value,
                })
              }
              placeholder="Enter your username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={loginCredentials.password}
              onChange={(e) =>
                setLoginCredentials({
                  ...loginCredentials,
                  password: e.target.value,
                })
              }
              placeholder="Enter your password"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const SignUpForm = () => {
  const [signupCredentials, setSignupCredentials] = useState<SignUpCredentials>(
    {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      gender: "",
      password: "",
      confirm_password: "",
    }
  );

  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const navigate = useNavigate();

  // Regex patterns for validation.
  const emailRegex = /^\S+@\S+\.\S+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSignupCredentials({
      ...signupCredentials,
      [name]: value,
    });

    // Live validation logic
    if (name === "email") {
      setEmailError(emailRegex.test(value) ? "" : "Invalid email format.");
    }

    if (name === "password") {
      setPasswordError(
        passwordRegex.test(value)
          ? ""
          : "Password must be at least 8 characters and contain a letter & number."
      );
      setPasswordsMatch(
        value === signupCredentials.confirm_password ||
          signupCredentials.confirm_password === ""
      );
    }

    if (name === "confirm_password") {
      setPasswordsMatch(signupCredentials.password === value);
    }

    if (name === "username") {
      setUsernameError(
        value.length < 3 ? "Username must be at least 3 characters long." : ""
      );
    }
  };

  const handleBlur = (field: string) => {
    if (field === "email") setEmailError("");
    if (field === "password") setPasswordError("");
    if (field === "username") setUsernameError("");
  };

  const handleSignupSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError || passwordError || usernameError) {
      toast.error("Fix the errors before signing up.");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const data = await register(signupCredentials);
      if (data.success) {
        toast.success("Signup successful! Redirecting to login...");
        setTimeout(() => navigate("/auth?login=true"), 3000);
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10 relative">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>Create your account to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSignupSubmission}>
          <div className="space-y-2">
            <Label htmlFor="firstName">Name</Label>
            <div className="flex gap-4">
              <div className="w-1/2">
                <Input
                  type="text"
                  placeholder="First"
                  name="first_name"
                  value={signupCredentials.first_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="w-1/2">
                <Input
                  type="text"
                  placeholder="Last"
                  name="last_name"
                  value={signupCredentials.last_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={signupCredentials.username}
              onChange={handleInputChange}
              onBlur={() => handleBlur("username")}
              placeholder="Enter your username"
            />
            {usernameError && (
              <p className="text-red-500 text-sm">{usernameError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={signupCredentials.email}
              onChange={handleInputChange}
              onBlur={() => handleBlur("email")}
              placeholder="Enter your email"
            />
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              name="gender"
              className="border p-2 rounded w-full bg-white"
              value={signupCredentials.gender}
              onChange={handleInputChange}
            >
              <option value="" disabled>
                Select your gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              placeholder="Password"
              name="password"
              value={signupCredentials.password}
              onChange={handleInputChange}
              onBlur={() => handleBlur("password")}
            />
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <Input
              type="password"
              placeholder="Confirm Password"
              name="confirm_password"
              value={signupCredentials.confirm_password}
              onChange={handleInputChange}
            />
            {!passwordsMatch && (
              <p className="text-red-500 text-sm">Passwords do not match!</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const AuthPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Determine initial mode based on query param: default to login if missing or true.
  const initialIsLogin = searchParams.get("login") !== "false";
  const [isLogin, setIsLogin] = useState(initialIsLogin);

  // Update query param when switching tabs.
  const handleTabChange = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setSearchParams({ login: loginMode ? "true" : "false" });
  };

  // If the query param changes externally, update local state.
  useEffect(() => {
    const param = searchParams.get("login");
    setIsLogin(param !== "false");
  }, [searchParams]);

  return (
    <>
      {/* Global Toaster */}
      <Toaster position="top-right" />
      <section className="mt-[5%] bg-gradient-to-r from-royalBlue to-midnightBlue text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Welcome Back" : "Create an Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Toggle Buttons using Shadcn Tabs */}
            <Tabs
              defaultValue={isLogin ? "login" : "signup"}
              className="w-full mb-6"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-full p-1">
                <TabsTrigger
                  value="login"
                  className={`rounded-full transition-all duration-300 ${
                    isLogin
                      ? "bg-gradient-to-r from-royalBlue to-midnightBlue text-white shadow-md"
                      : "bg-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabChange(true)}
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className={`rounded-full transition-all duration-300 ${
                    !isLogin
                      ? "bg-gradient-to-r from-royalBlue to-midnightBlue text-white shadow-md"
                      : "bg-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabChange(false)}
                >
                  Signup
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Form Container */}
            <div className="transition-opacity duration-500 ease-in-out">
              {isLogin ? <LoginForm /> : <SignUpForm />}
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
};

export default AuthPage;
