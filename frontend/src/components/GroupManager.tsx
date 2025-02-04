import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Users } from "lucide-react";
import { IoSearch } from "react-icons/io5";
import {
  createGroupChat,
  addUserToGroup,
  fetchAllChatForUser,
} from "@/api/groupApi";
import { fetchUsers } from "@/api/userApi";
import { setChatDetails } from "@/store/chatSlice";
import { User } from "@/types/main";

export const GroupManager = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // This useEffect fires when the search query changes.
  useEffect(() => {
    const searchUsersAsync = async () => {
      if (searchQuery.trim()) {
        try {
          const data = await fetchUsers({ username: searchQuery });
          setUsers(data || []);
        } catch (error) {
          console.error("Error searching users:", error);
        }
      }
    };
    const timeoutId = setTimeout(searchUsersAsync, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Working implementation for adding members (using groupId from the created group)
  const handleAddMembers = async (groupId: string) => {
    try {
      await Promise.all(
        selectedUsers.map((userId) => addUserToGroup(groupId, userId))
      );
      // Refresh chat details for the group
      const updatedChats = await fetchAllChatForUser();
      const updatedChat = updatedChats.chats.find(
        (c: any) => c.group_id === groupId
      );
      if (updatedChat) {
        dispatch(setChatDetails(updatedChat));
      }
      // Clear the selected users list after successfully adding members.
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error adding members:", error);
    }
  };

  // Create group and then add the selected members to it.
  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length === 0) return;
    setIsCreating(true);

    try {
      const groupResponse = await createGroupChat(groupName);
      // Immediately add the rest of the selected members to the newly created group.
      await handleAddMembers(groupResponse.groupId);
      setIsOpen(false);
      // Reset form fields
      setGroupName("");
      setSearchQuery("");
    } catch (error) {
      console.error("Group creation failed:", error);
      alert("Failed to create group. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Users className="h-4 w-4" />
        Create Group
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Start a new group chat with multiple members
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />

            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <ScrollArea className="h-64 border rounded-md">
              {users.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center p-2 hover:bg-muted cursor-pointer"
                  onClick={() => toggleUserSelection(user.user_id)}
                >
                  <Checkbox
                    checked={selectedUsers.includes(user.user_id)}
                    className="mr-2"
                  />
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback>{user.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName || selectedUsers.length <= 1 || isCreating}
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
