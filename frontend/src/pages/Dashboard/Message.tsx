import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setChatDetails, setLastMessage } from "@/store/chatSlice";
import { selectUser } from "@/store/userSlice";
import useSocketContext from "@/hooks/useSocketContext";
import { cn, formatDateAndTime } from "@/lib/utils";
import { fetchUsers } from "@/api/userApi";
import {
  addUserToGroup,
  createOneonOneGroup,
  deleteGroup,
  fetchAllChatForUser,
} from "@/api/groupApi";
import {
  getAllMessages,
  initialHiMessage,
  sendMessage,
} from "@/api/messageApi";
import { RootState, AppDispatch } from "@/store/store";
import { Message, Chat, User } from "@/types/main";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoSend, IoSearch } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { leaveGroup, removeMember } from "@/api/groupMemberApi";

// Chat Interface Input Component
interface ChatInterfaceInputProps {
  groupID: string;
}

const ChatInterfaceInput: React.FC<ChatInterfaceInputProps> = ({ groupID }) => {
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(groupID, message);
      setMessage("");
    } catch (error) {
      alert("Message sending failed");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          disabled={isSending}
          className="min-h-10"
        />
        <Button onClick={handleSend} disabled={isSending}>
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <IoSend className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

// Message Bubble Component
interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  timestamp: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  timestamp,
}) => (
  <div
    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}
  >
    <div
      className={`max-w-[75%] rounded-lg p-3 relative ${
        isCurrentUser ? "bg-black text-white" : "bg-white border border-primary"
      }`}
    >
      <p className="text-sm whitespace-pre-wrap break-words">
        {message.message_content}
      </p>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="text-xs mt-1 opacity-70 cursor-pointer">
            {formatDateAndTime(message.sent_at)}
          </p>
        </TooltipTrigger>
        <TooltipContent className="absolute bg-slate-500 w-[200px] -left-24 -bottom-16">
          <p>Sent at {new Date(message.sent_at).toLocaleString()}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </div>
);

// Chat Messages Component
interface ChatMessagesProps {
  groupID: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ groupID }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocketContext();
  const { username } = useSelector(selectUser);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const data = await getAllMessages(groupID);
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
      dispatch(setLastMessage({ groupID, lastMessage: message }));
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [groupID, dispatch, socket]);

  // Update the scroll effect:
  useEffect(() => {
    if (messagesEndRef.current && !isLoading) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    // Update the messages container:
    <ScrollArea className="h-[calc(100vh-180px)] p-4">
      {" "}
      {/* Adjust height */}
      <div className="flex flex-col justify-end min-h-full">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={`${"message-bubble" + msg.message_id}`}
              message={msg}
              isCurrentUser={msg.sender === username}
            />
          ))
        )}
        <div ref={messagesEndRef} className="pt-4" />
      </div>
    </ScrollArea>
  );
};

interface ChatHeaderProps {
  chatDetails: {
    group_id: string;
    group_name: string;
    is_direct_message: boolean;
    chat_info: {
      otherUser?: {
        user_id: string;
        username: string;
        profilePicture?: string;
      };
      groupPicture?: string;
      members?: Array<{
        user_id: string;
        username: string;
        profilePicture?: string;
        role: string;
      }>;
    };
  };
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatDetails }) => {
  const { group_name, is_direct_message, chat_info } = chatDetails;
  const { activeUsers } = useSocketContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get current user from Redux
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser.user_id;

  // For direct messages, determine online status.
  const isOnline = is_direct_message
    ? activeUsers.includes(chat_info.otherUser?.user_id)
    : false;

  // Determine if current user is admin in group chat.
  const isAdmin = (chat_info?.members || []).some(
    (member: any) => member.user_id === currentUserId && member.role === "admin"
  );

  // Local state for dialogs, sheet, and member search.
  const [open, setOpen] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // State for confirmation dialogs
  const [removeMemberOpen, setRemoveMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [confirmMemberLeaveOpen, setConfirmMemberLeaveOpen] = useState(false);

  // ----- API Handler: Add Members -----
  const handleAddMembers = async () => {
    try {
      await Promise.all(
        selectedUsers.map((userId) =>
          addUserToGroup(chatDetails.group_id, userId)
        )
      );
      // Refresh chat details (assume fetchAllChatForUser returns updated chats)
      const updatedChats = await fetchAllChatForUser();
      const updatedChat = updatedChats.chats.find(
        (c: any) => c.group_id === chatDetails.group_id
      );
      if (updatedChat) {
        dispatch(setChatDetails(updatedChat));
      }
      setAddMembersOpen(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error adding members:", error);
    }
  };

  const searchUsersHandler = async (query: string) => {
    try {
      const data = await fetchUsers({ username: query });
      setUsers(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // ----- Group Leave / Delete Handlers -----
  // For admin: show confirmation dialog for leaving (i.e. deleting the group)
  const handleAdminLeave = () => {
    setConfirmLeaveOpen(true);
  };

  // For non-admin: leave group directly.
  const handleMemberLeave = () => {
    setConfirmMemberLeaveOpen(true);
  };

  // Confirm admin leave: delete group.
  const confirmAdminLeave = async () => {
    try {
      const response = await deleteGroup(chatDetails.group_id);
      if (response.success) {
        setAlertMessage(response.message || "Group deleted successfully.");
        setAlertOpen(true);
        setConfirmLeaveOpen(false);
        setTimeout(() => {
          setAlertOpen(false);
          navigate("/dashboard/message");
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      console.error("Error while deleting the group.", err);
      setConfirmLeaveOpen(false);
    }
  };

  // Confirm member leave
  const confirmMemberLeave = async () => {
    try {
      const response = await leaveGroup(chatDetails.group_id);
      if (response.success) {
        setAlertMessage(response.message || "You have left the group.");
        setAlertOpen(true);
        setTimeout(() => {
          setAlertOpen(false);
          navigate("/dashboard/message");
          window.location.reload();
        }, 2000);
      }
      setConfirmMemberLeaveOpen(false);
    } catch (err) {
      console.error("Error while leaving the group.", err);
      setConfirmMemberLeaveOpen(false);
    }
  };

  // ----- Member Removal Handler (for admin removing another member) -----
  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      const response = await removeMember(chatDetails.group_id, memberToRemove);
      if (response.success) {
        if (response.message.toLowerCase().includes("deleted")) {
          setAlertMessage(response.message);
          setAlertOpen(true);
          setTimeout(() => {
            setAlertOpen(false);
            navigate("/dashboard/message");
            window.location.reload();
          }, 2000);
        } else {
          const updatedChats = await fetchAllChatForUser();
          const updatedChat = updatedChats.chats.find(
            (c: any) => c.group_id === chatDetails.group_id
          );
          if (updatedChat) {
            dispatch(setChatDetails(updatedChat));
          }
        }
      }
      setRemoveMemberOpen(false);
      setMemberToRemove(null);
    } catch (err) {
      console.error("Error removing member:", err);
      setRemoveMemberOpen(false);
      setMemberToRemove(null);
    }
  };

  return (
    <div className="border-b p-4 bg-white/95 shadow-md flex items-center justify-between space-x-4">
      {/* Left Side: Avatar and Chat/Group Name */}
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          {is_direct_message ? (
            <>
              <AvatarImage src={chat_info.otherUser?.profilePicture} />
              <AvatarFallback>
                {chat_info.otherUser?.username[0]?.toUpperCase()}
              </AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage src={chat_info.groupPicture} />
              <AvatarFallback>{group_name[0]?.toUpperCase()}</AvatarFallback>
            </>
          )}
        </Avatar>
        <div>
          <h2 className="font-bold text-lg">
            {is_direct_message ? chat_info.otherUser?.username : group_name}
          </h2>
          {is_direct_message && (
            <Badge
              variant={isOnline ? "default" : "secondary"}
              className="text-xs"
            >
              {isOnline ? "Online" : "Offline"}
            </Badge>
          )}
        </div>
      </div>

      {/* Right Side: Options Sheet */}
      <div className="flex items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <BsThreeDotsVertical className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 rounded-lg p-6 shadow-lg">
            <SheetHeader>
              <SheetTitle>
                {chatDetails.is_direct_message
                  ? "Direct Message Info"
                  : "Group Info"}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              {chatDetails.is_direct_message ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={chat_info.otherUser?.profilePicture} />
                    <AvatarFallback>
                      {chat_info.otherUser?.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="capitalize font-semibold text-xl">
                    {chat_info.otherUser?.username}
                  </h4>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={chat_info.groupPicture} />
                      <AvatarFallback>
                        {group_name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="capitalize font-semibold text-xl">
                      {group_name}
                    </h4>
                  </div>
                  <div className="w-full flex gap-2 mb-4">
                    {isAdmin ? (
                      <Button
                        size="sm"
                        onClick={handleAdminLeave}
                        className="text-red-500 bg-white hover:bg-gray-100 border rounded-md"
                      >
                        <Trash2 className="h-4 w-4 mr-2 text-red-500" /> Delete
                        Group
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleMemberLeave}
                        variant="outline"
                        className="px-3 rounded-md"
                      >
                        Leave Group
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => setAddMembersOpen(true)}
                      variant="outline"
                      className="rounded-md"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Members
                    </Button>
                  </div>
                  <h3 className="text-lg font-medium w-full">
                    Members ({chat_info?.members?.length || 0})
                  </h3>
                  <ScrollArea className="h-fit">
                    {(chat_info?.members || []).map(
                      (member: any, index: number) => (
                        <div
                          key={`member-${member.user_id}-${index}`}
                          className={`flex items-center gap-3 py-2 px-2 border-b last:border-b-0 ${
                            member.user_id === currentUserId
                              ? "bg-green-50"
                              : ""
                          }`}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.profilePicture} />
                            <AvatarFallback>
                              {member.username[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="capitalize font-semibold">
                              {member.username}
                            </h4>
                            <span
                              className={`text-sm ${
                                member.role === "admin"
                                  ? "font-bold text-gray-800"
                                  : "font-normal text-gray-600"
                              }`}
                            >
                              {member.role}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {member.user_id === currentUserId ? (
                              <Button
                                variant="outline"
                                size="xs"
                                className="px-3 rounded-md"
                                onClick={handleMemberLeave}
                              >
                                Leave
                              </Button>
                            ) : (
                              isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => {
                                    setMemberToRemove(member.user_id);
                                    setRemoveMemberOpen(true);
                                  }}
                                  className="rounded-md"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </ScrollArea>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Add Members Dialog */}
      <Dialog open={addMembersOpen} onOpenChange={setAddMembersOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-lg p-6">
          <DialogHeader>
            <DialogTitle>Add Members to Group</DialogTitle>
            <DialogDescription>
              Search and select users to add to this group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsersHandler(e.target.value);
                }}
              />
            </div>
            <ScrollArea className="h-64 border rounded-md">
              {users.map((user) => (
                <div
                  key={`search-user-${user.user_id}`}
                  className="flex items-center p-2 hover:bg-muted cursor-pointer"
                  onClick={() =>
                    setSelectedUsers((prev) =>
                      prev.includes(user.user_id)
                        ? prev.filter((id) => id !== user.user_id)
                        : [...prev, user.user_id]
                    )
                  }
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
              onClick={handleAddMembers}
              disabled={selectedUsers.length === 0}
              className="rounded-md"
            >
              Add Selected Members
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog for Notifications */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="rounded-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Notification</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog for Admin Leaving / Deleting Group */}
      <AlertDialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
        <AlertDialogContent className="rounded-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Group Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              You are an admin. Leaving the group will delete the group and
              remove all members. Do you wish to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAdminLeave}
              className="bg-red-500 hover:bg-red-600 rounded-md"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={removeMemberOpen} onOpenChange={setRemoveMemberOpen}>
        <AlertDialogContent className="rounded-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Member Removal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the group? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              className="bg-red-500 hover:bg-red-600 rounded-md"
            >
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Member Leave Confirmation Dialog */}
      <AlertDialog
        open={confirmMemberLeaveOpen}
        onOpenChange={setConfirmMemberLeaveOpen}
      >
        <AlertDialogContent className="rounded-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Leave Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this group? You won't be able to
              access the chat history unless you're re-added.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMemberLeave}
              className="bg-red-500 hover:bg-red-600 rounded-md"
            >
              Leave Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
// Chat Interface Component
const ChatInterface: React.FC = () => {
  const { chatDetails } = useSelector((state: RootState) => state.chat);
  if (!chatDetails) return null;

  return (
    <div className="flex flex-col h-full">
      <ChatHeader chatDetails={chatDetails} />
      <ChatMessages groupID={chatDetails.group_id} />
      <ChatInterfaceInput groupID={chatDetails.group_id} />
    </div>
  );
};

// Chat List Item Component
interface ChatListItemProps {
  chat: {
    group_id: string;
    group_name: string;
    is_direct_message: boolean;
    chat_info: {
      otherUser?: {
        user_id: string;
        username: string;
        profilePicture?: string;
      };
      groupPicture?: string;
      members?: Array<{
        user_id: string;
        username: string;
        profilePicture?: string;
        role: string;
      }>;
    };
  };
  isActive?: boolean;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, isActive }) => {
  const dispatch: AppDispatch = useDispatch();
  const { activeUsers } = useSocketContext();
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser.user_id;
  const { lastMessage } = useSelector((state: RootState) => state.chat);

  // Calculate whether the chat should be treated as a DM:
  const hasTwoMembers =
    chat.chat_info.members && chat.chat_info.members.length === 2;
  const computedIsDM = chat.is_direct_message || hasTwoMembers;

  // For DM chats, derive the "other user" information.
  let otherUser = chat.chat_info.otherUser;
  if (computedIsDM && !otherUser && chat.chat_info.members) {
    // If otherUser is not provided, look up the member whose id is not the current user.
    otherUser = chat.chat_info.members.find(
      (member) => member.user_id !== currentUserId
    );
  }

  // Display name: if DM, use the other user's username; otherwise use the group's name.
  const displayName =
    computedIsDM && otherUser ? otherUser.username : chat.group_name;
  // For DM, we consider the member count to be 2.
  const memberCount = !computedIsDM ? chat.chat_info.members?.length : 2;

  // Get the last message for this chat.
  const lastMsg = lastMessage[chat.group_id];

  return (
    <div
      className={`p-4 hover:bg-muted cursor-pointer transition-colors ${
        isActive ? "bg-muted" : ""
      }`}
      onClick={() => dispatch(setChatDetails(chat))}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-12 w-12">
            {computedIsDM ? (
              <>
                <AvatarImage src={otherUser?.profilePicture} />
                <AvatarFallback>
                  {otherUser?.username[0]?.toUpperCase()}
                </AvatarFallback>
              </>
            ) : (
              <>
                <AvatarImage src={chat.chat_info.groupPicture} />
                <AvatarFallback>{chat.group_name[0]}</AvatarFallback>
              </>
            )}
          </Avatar>
          {computedIsDM && activeUsers.includes(otherUser?.user_id || "") && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold truncate">
              {displayName}
              {!computedIsDM && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({memberCount} members)
                </span>
              )}
            </h3>
            {lastMsg?.sent_at && (
              <span className="text-xs text-muted-foreground ml-2">
                {formatDateAndTime(lastMsg.sent_at)}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {lastMsg?.sender === currentUser.username ? "You: " : ""}
            {lastMsg?.message_content || "No messages yet"}
          </p>
        </div>
      </div>
    </div>
  );
};

// User List Item Component
interface UserListItemProps {
  user: User;
  onChatCreated: () => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, onChatCreated }) => {
  const { activeUsers } = useSocketContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomMessage, setShowCustomMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState(
    "Hi! Would you like to chat?"
  );
  const dispatch = useDispatch();
  const isOnline = activeUsers.includes(user.user_id);
  const navigate = useNavigate();
  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    try {
      // 1. Create the chat group
      const groupResponse = await createOneonOneGroup(user.user_id);

      if (!groupResponse.success || !groupResponse.group) {
        throw new Error(`Failed to create chat with ${user.username}`);
      }

      // 2. Construct proper chat object
      const newChat: Chat = {
        ...groupResponse.group,
        group_name: user.username,
        chat_info: {
          otherUser: user,
          members: [user], // Add current user if needed
        },
        is_direct_message: true,
      };

      // 3. Update Redux state immediately
      dispatch(setChatDetails(newChat));
      dispatch(
        setLastMessage({
          groupID: newChat.group_id,
          lastMessage: {
            message_id: `temp-${Date.now()}`, // Temporary ID
            sender: user.user_id,
            message_content: message,
            sent_at: new Date().toISOString(),
            group_id: newChat.group_id,
          },
        })
      );

      // 4. Send initial message
      const messageResponse = await initialHiMessage(
        newChat.group_id,
        user.user_id,
        customMessage
      );

      if (!messageResponse.success) {
        throw new Error("Message sent but failed to update server");
      }

      navigate("/dashboard/message");
      window.location.reload();
      // 5. Update with real message data
      dispatch(
        setLastMessage({
          groupID: newChat.group_id,
          lastMessage: messageResponse.message,
        })
      );

      // 6. Refresh chats list and close dialog
      if (onChatCreated) onChatCreated();
      setShowCustomMessage(false);
    } catch (error) {
      console.error("Chat creation error:", error);
      alert(error instanceof Error ? error.message : "Failed to create chat");
      // Rollback temporary state
      dispatch(setChatDetails(null));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="p-4 hover:bg-muted cursor-pointer transition-colors">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar>
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{user.username}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowCustomMessage(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Say Hi!"
            )}
          </Button>
        </div>
      </div>

      <Dialog open={showCustomMessage} onOpenChange={setShowCustomMessage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send a message to {user.username}</DialogTitle>
            <DialogDescription>
              Start your conversation with a friendly message
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCustomMessage(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSendMessage(customMessage)}
              disabled={isLoading || !customMessage.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
// Chat List Component
const ChatList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"explore" | "my-chat">("my-chat");
  const [search, setSearch] = useState<string>("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocketContext();
  const { chatDetails } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    const loadChats = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllChatForUser();
        setChats(data.chats || []);
        if (data.chats?.length > 0) {
          socket.emit(
            "joinChat",
            data.chats.map((c) => c.group_id)
          );
        }
      } catch (error) {
        console.error("Error loading chats:", error);
        setChats([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (activeTab === "my-chat") loadChats();
  }, [activeTab, socket]);

  useEffect(() => {
    const searchUsers = async () => {
      if (activeTab === "explore" && search.trim()) {
        setIsLoading(true);
        try {
          const data = await fetchUsers({ username: search });
          setUsers(data || []);
        } catch (error) {
          console.error("Error searching users:", error);
          setUsers([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUsers([]); // Clear users when search is empty
      }
    };
    const timeoutId = setTimeout(searchUsers, 500);
    return () => clearTimeout(timeoutId);
  }, [search, activeTab]);

  return (
    <div className="h-full flex flex-col border-r w-80 min-w-[320px] bg-background">
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "my-chat" ? "default" : "ghost"}
            onClick={() => setActiveTab("my-chat")}
            className="flex-1"
          >
            My Chats
          </Button>
          <Button
            variant={activeTab === "explore" ? "default" : "ghost"}
            onClick={() => setActiveTab("explore")}
            className="flex-1"
          >
            Explore
          </Button>
        </div>

        <div className="relative">
          <IoSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={
              activeTab === "explore" ? "Search users..." : "Search chats..."
            }
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "my-chat" ? (
          chats.length > 0 ? (
            chats
              .filter((chat) =>
                chat.group_name.toLowerCase().includes(search.toLowerCase())
              )
              .map((chat) => (
                <ChatListItem
                  key={chat.group_id}
                  chat={chat}
                  isActive={chatDetails?.group_id === chat.group_id}
                />
              ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>No chats found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setActiveTab("explore")}
              >
                Find People
              </Button>
            </div>
          )
        ) : (
          <>
            {users.length > 0 ? (
              users.map((user) => (
                <UserListItem
                  key={`${"user-item" + user.user_id}`}
                  user={user}
                  onChatCreated={() => {
                    // Refresh chats after creation
                    fetchAllChatForUser().then((data) => {
                      setChats(data.chats || []);
                    });
                  }}
                />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                {search.trim() ? (
                  <p>No users found matching "{search}"</p>
                ) : (
                  <p>Start searching to find people</p>
                )}
              </div>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
};

// No Chat Selected Component
const NoChatSelected: React.FC = () => {
  const { username } = useSelector(selectUser);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome, {username}! 👋</CardTitle>
          <CardDescription>
            Your messages will appear here once you select a chat
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="grid gap-4 text-center">
            <div>
              <h3 className="font-semibold">Start a conversation</h3>
              <p className="text-sm text-muted-foreground">
                Click "Explore" to find people and start chatting
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold">View your chats</h3>
              <p className="text-sm text-muted-foreground">
                Select a chat from the sidebar to view messages
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Messages Component
// Update the main container:
const Messages: React.FC = () => {
  const { chatDetails } = useSelector((state: RootState) => state.chat);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      <ChatList />
      <div className="flex-1 flex flex-col min-w-0">
        {chatDetails ? <ChatInterface /> : <NoChatSelected />}
      </div>
    </div>
  );
};

export default Messages;
