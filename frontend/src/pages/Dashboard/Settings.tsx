import { useState } from "react";
import { updateUserInformation, deleteUser } from "@/api/userApi";
import { useNavigate, useOutletContext } from "react-router-dom";
import { UserState } from "@/store/userSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Toaster, toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface User {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  gender: string;
  profilePicture?: string;
}

interface SettingsProps {
  user: User;
}

const Settings: React.FC<SettingsProps> = () => {
  const user = useOutletContext<UserState>();
  const {
    username,
    email,
    first_name,
    last_name,
    address,
    phoneNumber,
    gender,
    profilePicture,
  } = user;

  // State for toggling edit mode and tracking loading state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Local state for user information changes
  const [updatedUserInfo, setUpdatedUserInfo] = useState({
    username,
    email,
    first_name,
    last_name,
    address,
    phone_number: phoneNumber,
  });

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedUserInfo({ ...updatedUserInfo, [name]: value });
  };

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Show a loading toast notification
    const toastId = toast.loading("Updating your credentials...");
    try {
      const data = await updateUserInformation(updatedUserInfo);
      if (data.success) {
        toast.dismiss(toastId);
        toast.success(
          "Your credentials were changed successfully and you will have to login again"
        );
        // Delay for 2 seconds before logging out and redirecting
        setTimeout(() => {
          localStorage.removeItem("token");
          navigate("/auth?login=true");
        }, 2000);
      }
    } catch (err) {
      console.error("An error occurred during update", err);
      toast.dismiss(toastId);
      toast.error("An error occurred during update. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserDeletion = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const data = await deleteUser();
      if (data.success) {
        toast.success("Your account was deleted successfully!");
        localStorage.removeItem("token");
        navigate("/");
      }
    } catch (err) {
      console.error("An error occurred during deletion", err);
      toast.error("An error occurred during deletion. Please try again.");
    }
  };

  // Cancel editing: revert changes and disable edit mode
  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    setUpdatedUserInfo({
      username,
      email,
      first_name,
      last_name,
      address,
      phone_number: phoneNumber,
    });
    setIsEditing(false);
  };

  return (
    <>
      {/* Global Toast container */}
      <Toaster position="top-right" />

      <section className="py-10">
        <Card className="max-w-xl mx-auto p-6">
          <CardHeader className="text-center">
            <div className="h-32 w-32 mx-auto mb-4 overflow-hidden rounded-full bg-royalBlue">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={username[0].toUpperCase()}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-4xl text-white">
                    {username[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold">{username}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUserUpdate}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    General Information
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="first_name" className="text-sm">
                        First Name
                      </label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={updatedUserInfo.first_name}
                        onChange={handleInputChange}
                        disabled={!isEditing || isLoading}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="last_name" className="text-sm">
                        Last Name
                      </label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={updatedUserInfo.last_name}
                        onChange={handleInputChange}
                        disabled={!isEditing || isLoading}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="gender" className="text-sm">
                      Gender
                    </label>
                    <Input id="gender" value={gender} disabled />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="username" className="text-sm">
                      Username
                    </label>
                    <Input
                      id="username"
                      name="username"
                      value={updatedUserInfo.username}
                      onChange={handleInputChange}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="address" className="text-sm">
                      Address
                    </label>
                    <Input
                      id="address"
                      name="address"
                      value={updatedUserInfo.address || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing || isLoading}
                      placeholder={!updatedUserInfo.address ? "N/A" : undefined}
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="phone_number" className="text-sm">
                        Phone Number
                      </label>
                      <Input
                        id="phone_number"
                        name="phone_number"
                        value={updatedUserInfo.phone_number || ""}
                        onChange={handleInputChange}
                        disabled={!isEditing || isLoading}
                        placeholder={
                          !updatedUserInfo.phone_number ? "N/A" : undefined
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="text-sm">
                        Email
                      </label>
                      <Input
                        id="email"
                        value={updatedUserInfo.email}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-4">
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsEditing(true);
                      }}
                      disabled={isLoading}
                    >
                      Enable Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        className="text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Saving...
                          </span>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
          <div className="flex justify-center gap-4 mt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-red-600 text-white">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Deleting your account is permanent and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex justify-end gap-4">
                  <AlertDialogCancel asChild>
                    <Button variant="outline">Cancel</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleUserDeletion}
                    className="bg-red-600 text-white"
                  >
                    Delete Account
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </section>
    </>
  );
};

export default Settings;
