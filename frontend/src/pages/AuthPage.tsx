import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [message, setMessage] = useState<string>("");
  const handleLoginSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(loginCredentials);
      const { token } = data;
      if (!token) {
        console.error("Token was not found in the response", data);
        setMessage("Login failed: Token not received.");
        setTimeout(() => setMessage(""), 3000);
        return;
      }
      localStorage.setItem("token", token);
      console.log("Token saved to localStorage");
      setMessage("Login successful! Redirecting...");
      setTimeout(() => {
        setMessage("");
        navigate("/dashboard");
      }, 3000);
    } catch (err) {
      console.error("Error Occurred", err);
      setMessage("Sorry!! The credentials miss match");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10">
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
              value={loginCredentials.username || ""}
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
              value={loginCredentials.password || ""}
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
      {message && (
        <Alert
          variant={message ? "success" : "destructive"}
          className="absolute w-fit top-20 right-2 bg-white shadow-lg"
        >
          <AlertTitle className="font-bold">
            {message ? "Success!" : "Error"}
          </AlertTitle>
          <AlertDescription className="font-semibold">
            {message}
          </AlertDescription>
        </Alert>
      )}
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
  const [message, setMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSignupCredentials({
      ...signupCredentials,
      [name]: value,
    });

    if (name === "password" || name === "confirm_password") {
      setPasswordsMatch(
        signupCredentials.password === value ||
          signupCredentials.confirm_password === value
      );
    }
  };

  const handleSignupSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const data = await register(signupCredentials);
      const { success } = data;
      if (success) {
        setMessage("Welcome to TeamSync\nYou may proceed to login");
        setIsSuccess(true);
      } else {
        setMessage("Sorry!!! there was an issue with your signup");
        setIsSuccess(false);
      }
    } catch (err) {
      console.error("Signup Error:", err);
      setMessage("An error occurred during signup. Please try again later.");
      setIsSuccess(false);
    }
  };

  setTimeout(() => {
    setMessage("");
  }, 3000);

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Create your account to get started with TeamSync.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSignupSubmission}>
          <div className="space-y-2">
            <Label htmlFor="firstName">Name</Label>
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="First"
                name="first_name"
                value={signupCredentials.first_name}
                onChange={handleInputChange}
              />
              <Input
                type="text"
                placeholder="Last"
                name="last_name"
                value={signupCredentials.last_name}
                onChange={handleInputChange}
              />
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
              placeholder="itzzsaurap"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={signupCredentials.email}
              onChange={handleInputChange}
              placeholder="social.saurav2003@gmail.com"
            />
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
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Password"
                name="password"
                value={signupCredentials.password}
                onChange={handleInputChange}
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                name="confirm_password"
                value={signupCredentials.confirm_password}
                onChange={handleInputChange}
              />
            </div>
            {!passwordsMatch && (
              <p className="text-red-500 text-sm">Passwords do not match!</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
      </CardContent>
      {message && (
        <Alert
          variant={isSuccess ? "success" : "destructive"}
          className="absolute w-fit top-20 right-2 bg-white shadow-lg"
        >
          <AlertTitle className="font-bold">
            {isSuccess ? "Success!" : "Error"}
          </AlertTitle>
          <AlertDescription className="font-semibold">
            {message}
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
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
                  onClick={() => setIsLogin(true)}
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
                  onClick={() => setIsLogin(false)}
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
