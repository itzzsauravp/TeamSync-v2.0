import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearChatSlice,
  setChatDetails,
  setLastMessage,
} from "@/store/chatSlice";
import { selectUser } from "@/store/userSlice";
import useSocketContext from "@/hooks/useSocketContext";
import { formatDateAndTime } from "@/lib/utils";
import { fetchUsers } from "@/api/userApi";
import {
  addUserToGroup,
  createOneonOneGroup,
  deleteGroup,
  fetchAllChatForUser,
} from "@/api/groupApi";
import {
  deleteFileMessage,
  deleteMessage,
  getAllMessages,
  getFileData,
  initialHiMessage,
  sendFileMessage,
  sendMessage,
  updateFileMessage,
  updateMessage,
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
import { FileIcon, Loader2, PaperclipIcon, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEventsForGroup } from "@/api/eventApi";

interface ChatInterfaceInputProps {
  groupID: string;
}
interface MessageBubbleProps {
  message: {
    message_id: string;
    sender: string;
    message_content: string;
    file_name?: string;
    file_type?: string;
    sent_at: string;
    edited?: boolean;
  };
  isCurrentUser: boolean;
}
interface ChatMessagesProps {
  groupID: string;
}
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
interface UserListItemProps {
  user: User;
  onChatCreated: () => void;
}
const ChatInterfaceInput: React.FC<ChatInterfaceInputProps> = ({ groupID }) => {
  const [message, setMessage] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const limitedFiles = files.slice(0, 5);
    const previews = limitedFiles.map((file) => ({
      file,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));
    setSelectedFiles(previews);
  };

  useEffect(() => {
    return () => {
      selectedFiles.forEach((fp) => {
        if (fp.previewUrl) {
          URL.revokeObjectURL(fp.previewUrl);
        }
      });
    };
  }, [selectedFiles]);

  const handleSend = async () => {
    if (isSending) return;
    if (!message.trim() && selectedFiles.length === 0) return;
    setIsSending(true);
    try {
      for (const fp of selectedFiles) {
        await sendFileMessage(groupID, fp.file, message);
      }
      if (!selectedFiles.length && message.trim()) {
        await sendMessage(groupID, message);
      }
      setMessage("");
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      alert("Message sending failed");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col gap-2">
        {/* Display selected file previews (if any) */}
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((fp, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 border rounded-md"
              >
                {fp.previewUrl ? (
                  <img
                    src={fp.previewUrl}
                    alt={fp.file.name}
                    className="h-16 w-16 object-cover rounded"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <PaperclipIcon className="h-6 w-6" />
                    <span className="text-xs">{fp.file.name}</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={isSending}
            className="min-h-10 flex-1"
          />

          {/* Button to trigger file selection */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            variant="outline"
          >
            <PaperclipIcon className="h-4 w-4" />
          </Button>

          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IoSend className="h-4 w-4" />
            )}
          </Button>

          {/* Hidden file input (allow multiple selection) */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </div>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(message.message_content);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editFilePreview, setEditFilePreview] = useState<string | null>(null);

  useEffect(() => {
    if (
      message.file_name &&
      message.file_type?.startsWith("image/") &&
      !isEditing
    ) {
      const fetchImage = async () => {
        try {
          const blob = await getFileData(message.message_id);
          const url = window.URL.createObjectURL(blob);
          setFileUrl(url);
        } catch (error) {
          console.error("Error fetching image file:", error);
        }
      };
      fetchImage();
    }
    return () => {
      if (fileUrl) {
        window.URL.revokeObjectURL(fileUrl);
      }
    };
  }, [message, isEditing, fileUrl]);

  useEffect(() => {
    if (editFile && editFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(editFile);
      setEditFilePreview(url);
      return () => {
        if (editFilePreview) URL.revokeObjectURL(editFilePreview);
      };
    } else {
      setEditFilePreview(null);
    }
  }, [editFile]);

  const handlePreview = async () => {
    try {
      if (
        message.file_type &&
        (message.file_type.startsWith("image/") ||
          message.file_type === "application/pdf")
      ) {
        const blob = await getFileData(message.message_id);
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        alert("Preview not available for this file type.");
      }
    } catch (error) {
      console.error("Error previewing file:", error);
    }
  };

  const handleSave = async () => {
    try {
      const blob = await getFileData(message.message_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = message.file_name || "download";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  const handleEditSave = async () => {
    try {
      let updated;
      if (message.file_name) {
        
        if (!editFile) {
          alert("Please select a new file to update this file message.");
          return;
        }
        updated = await updateFileMessage(
          message.message_id,
          editFile,
          editMessage
        );
      } else {
        updated = await updateMessage(message.message_id, editMessage);
      }
      setIsEditing(false);
    } catch (error) {
      alert("Failed to update message.");
      console.error(error);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditMessage(message.message_content);
    setEditFile(null);
    setEditFilePreview(null);
  };

  const handleDelete = async () => {
    try {
      if (message.file_name) {
        await deleteFileMessage(message.message_id);
      } else {
        await deleteMessage(message.message_id);
      }
    } catch (error) {
      alert("Failed to delete message.");
      console.error(error);
    }
  };

  if (isEditing) {
    return (
      <div
        className={`flex ${
          isCurrentUser ? "justify-end" : "justify-start"
        } mb-4`}
      >
        <div
          className={`max-w-[75%] rounded-lg p-3 relative ${
            isCurrentUser
              ? "bg-black text-white"
              : "bg-white border border-primary"
          }`}
        >
          {message.file_name && (
            <div className="mb-2">
              {editFile ? (
                editFile.type.startsWith("image/") && editFilePreview ? (
                  <img
                    src={editFilePreview}
                    alt="New Preview"
                    className="rounded-md max-h-60 object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-6 w-6" />
                    <span className="text-xs font-medium">
                      {editFile?.name}
                    </span>
                  </div>
                )
              ) : (
                fileUrl && (
                  <img
                    src={fileUrl}
                    alt={message.file_name}
                    className="rounded-md max-h-60 object-contain"
                  />
                )
              )}
              <Input
                type="file"
                onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>
          )}
          <Input
            value={editMessage}
            onChange={(e) => setEditMessage(e.target.value)}
            placeholder="Edit your message"
            className="mb-2"
          />
          <div className="flex gap-2">
            <Button onClick={handleEditSave} size="sm">
              Save
            </Button>
            <Button onClick={handleEditCancel} size="sm" variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[75%] rounded-lg p-3 relative ${
          isCurrentUser
            ? "bg-black text-white"
            : "bg-white border border-primary"
        }`}
      >
        {/* Three-dots menu for current user messages */}
        {isCurrentUser && (
          <div className="absolute -left-9 top-1/2 transform -translate-y-1/2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 2a2 2 0 110 4 2 2 0 010-4zm0 6a2 2 0 110 4 2 2 0 010-4z" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border border-gray-200 rounded-md shadow-md py-1 min-w-[120px] text-xs transition-all duration-150 ease-in-out">
                <DropdownMenuItem
                  onSelect={() => setIsEditing(true)}
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={handleDelete}
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {message.file_name ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer">
                {message.file_type?.startsWith("image/") ? (
                  fileUrl ? (
                    <img
                      src={fileUrl}
                      alt={message.file_name}
                      className="rounded-md max-h-60 object-contain"
                    />
                  ) : (
                    <div className="text-sm text-gray-500">
                      Loading image...
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-6 w-6" />
                    <div>
                      <div className="text-xs font-medium">
                        {message.file_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {message.file_type}
                      </div>
                    </div>
                  </div>
                )}
                {message.message_content && (
                  <p className="text-sm mt-2 whitespace-pre-wrap break-words">
                    {message.message_content}
                  </p>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 rounded-md shadow-md py-1 min-w-[120px] text-xs transition-all duration-150 ease-in-out">
              <DropdownMenuItem
                onSelect={handlePreview}
                className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              >
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleSave}
                className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              >
                Save
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message_content}
          </p>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-xs mt-1 opacity-70 cursor-pointer">
              {formatDateAndTime(message.sent_at)}
              {message.edited && " (edited)"}
            </p>
          </TooltipTrigger>
          <TooltipContent className="absolute bg-slate-500 w-[200px] -left-24 -bottom-16">
            <p>Sent at {new Date(message.sent_at).toLocaleString()}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

const ChatMessages: React.FC<ChatMessagesProps> = ({ groupID }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocketContext();
  const { username } = useSelector((state: any) => state.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  // When the groupID changes, clear previous messages first.
  useEffect(() => {
    setMessages([]); // Clear previous messages immediately.
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const data = await getAllMessages(groupID);
        const msgs: Message[] = data.messages || [];
        setMessages(msgs);
        // Update the Redux store with the last message (if any)
        dispatch(
          setLastMessage({
            groupID,
            lastMessage: msgs.length > 0 ? msgs[msgs.length - 1] : null,
          })
        );
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [groupID, dispatch]);

  // Socket listeners for real‑time updates
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setMessages((prev) => {
        const newMessages = [...prev, message];
        dispatch(setLastMessage({ groupID, lastMessage: message }));
        return newMessages;
      });
    };

    const handleUpdateMessage = (updatedMessage: Message) => {
      setMessages((prevMessages) => {
        const newMessages = prevMessages.map((msg) =>
          msg.message_id === updatedMessage.message_id ? updatedMessage : msg
        );
        // If the updated message is the last one, update the store.
        if (
          newMessages.length > 0 &&
          newMessages[newMessages.length - 1].message_id ===
            updatedMessage.message_id
        ) {
          dispatch(setLastMessage({ groupID, lastMessage: updatedMessage }));
        }
        return newMessages;
      });
    };

    const handleDeleteMessage = ({ message_id }: { message_id: string }) => {
      setMessages((prevMessages) => {
        const newMessages = prevMessages.filter(
          (msg) => msg.message_id !== message_id
        );
        // If the deleted message was the last one, update the store.
        if (
          prevMessages.length > 0 &&
          prevMessages[prevMessages.length - 1].message_id === message_id
        ) {
          const newLast =
            newMessages.length > 0 ? newMessages[newMessages.length - 1] : null;
          dispatch(setLastMessage({ groupID, lastMessage: newLast }));
        }
        return newMessages;
      });
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("updateMessage", handleUpdateMessage);
    socket.on("deleteMessage", handleDeleteMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("updateMessage", handleUpdateMessage);
      socket.off("deleteMessage", handleDeleteMessage);
    };
  }, [groupID, socket, dispatch]);

  // Scroll effect
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
    <ScrollArea className="h-[calc(100vh-180px)] p-4">
      <div className="flex flex-col justify-end min-h-full">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.message_id}
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

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatDetails }) => {
  const { group_name, is_direct_message, chat_info } = chatDetails;
  const { activeUsers, socket } = useSocketContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Current user info from Redux
  const currentUser = useSelector((state: any) => state.user);
  const currentUserId = currentUser.user_id;

  // Determine online status (for direct messages)
  const isOnline = is_direct_message
    ? activeUsers.includes(chat_info.otherUser?.user_id)
    : false;

  // Determine admin status in a group chat
  const isAdmin = (chat_info?.members || []).some(
    (member: any) => member.user_id === currentUserId && member.role === "admin"
  );

  // Local state for dialogs, sheet, search, and events
  const [open, setOpen] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Confirmation dialogs for member removal/leaving group
  const [removeMemberOpen, setRemoveMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [confirmMemberLeaveOpen, setConfirmMemberLeaveOpen] = useState(false);

  // Local state for file and image messages
  const [fileMessages, setFileMessages] = useState<any[]>([]);
  const [imageMessages, setImageMessages] = useState<any[]>([]);
  const [filesLoading, setFilesLoading] = useState<boolean>(false);

  // Local state for group events
  const [groupEvents, setGroupEvents] = useState<any[]>([]);

  // Load files & images when the group changes
  useEffect(() => {
    const loadFiles = async () => {
      setFilesLoading(true);
      try {
        const data = await getAllMessages(chatDetails.group_id);
        const messages: any[] = data.messages || [];
        const files = messages.filter(
          (m) => m.file_name && !m.file_type?.startsWith("image/")
        );
        const images = messages.filter(
          (m) => m.file_name && m.file_type?.startsWith("image/")
        );
        setFileMessages(files);
        setImageMessages(images);
      } catch (error) {
        console.error("Error loading files/images:", error);
      } finally {
        setFilesLoading(false);
      }
    };
    loadFiles();
  }, [chatDetails.group_id]);

  // Load group events when the group changes
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getEventsForGroup(chatDetails.group_id);
        setGroupEvents(data.events || []);
      } catch (error) {
        console.error("Error loading events:", error);
      }
    };
    loadEvents();
  }, [chatDetails.group_id]);

  // Subscribe to real-time updates for file/image messages
  useEffect(() => {
    const handleFileMessage = (message: any) => {
      if (message.group_id !== chatDetails.group_id || !message.file_name)
        return;
      if (message.file_type?.startsWith("image/")) {
        setImageMessages((prev) => {
          const exists = prev.find(
            (msg) => msg.message_id === message.message_id
          );
          return exists
            ? prev.map((msg) =>
                msg.message_id === message.message_id ? message : msg
              )
            : [...prev, message];
        });
      } else {
        setFileMessages((prev) => {
          const exists = prev.find(
            (msg) => msg.message_id === message.message_id
          );
          return exists
            ? prev.map((msg) =>
                msg.message_id === message.message_id ? message : msg
              )
            : [...prev, message];
        });
      }
    };

    const handleDeleteMessage = ({ message_id }: { message_id: string }) => {
      setFileMessages((prev) =>
        prev.filter((msg) => msg.message_id !== message_id)
      );
      setImageMessages((prev) =>
        prev.filter((msg) => msg.message_id !== message_id)
      );
    };

    socket.on("newMessage", handleFileMessage);
    socket.on("updateMessage", handleFileMessage);
    socket.on("deleteMessage", handleDeleteMessage);

    return () => {
      socket.off("newMessage", handleFileMessage);
      socket.off("updateMessage", handleFileMessage);
      socket.off("deleteMessage", handleDeleteMessage);
    };
  }, [chatDetails.group_id, socket]);

  // Subscribe to real-time event updates
  useEffect(() => {
    const handleNewEvent = (event: any) => {
      if (event.group_id === chatDetails.group_id) {
        setGroupEvents((prev) => [...prev, event]);
      }
    };

    const handleUpdateEvent = (updatedEvent: any) => {
      setGroupEvents((prev) =>
        prev.map((ev) =>
          ev.event_id === updatedEvent.event_id ? updatedEvent : ev
        )
      );
    };

    const handleDeleteEvent = ({ event_id }: { event_id: string }) => {
      setGroupEvents((prev) => prev.filter((ev) => ev.event_id !== event_id));
    };

    socket.on("newEvent", handleNewEvent);
    socket.on("updateEvent", handleUpdateEvent);
    socket.on("deleteEvent", handleDeleteEvent);

    return () => {
      socket.off("newEvent", handleNewEvent);
      socket.off("updateEvent", handleUpdateEvent);
      socket.off("deleteEvent", handleDeleteEvent);
    };
  }, [chatDetails.group_id, socket]);

  // Handlers for group member actions
  const handleAddMembers = async () => {
    try {
      await Promise.all(
        selectedUsers.map((userId) =>
          addUserToGroup(chatDetails.group_id, userId)
        )
      );
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

  const handleAdminLeave = () => setConfirmLeaveOpen(true);
  const handleMemberLeave = () => setConfirmMemberLeaveOpen(true);

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
      console.error("Error deleting the group:", err);
      setConfirmLeaveOpen(false);
    }
  };

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
      console.error("Error leaving the group:", err);
      setConfirmMemberLeaveOpen(false);
    }
  };

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

  // A helper component for displaying image thumbnails
  const GroupImageThumbnail: React.FC<{ message: any }> = ({ message }) => {
    const [thumbUrl, setThumbUrl] = useState<string | null>(null);
    useEffect(() => {
      const fetchThumb = async () => {
        try {
          const blob = await getFileData(message.message_id);
          const url = window.URL.createObjectURL(blob);
          setThumbUrl(url);
        } catch (error) {
          console.error("Error fetching thumbnail:", error);
        }
      };
      fetchThumb();
      return () => {
        if (thumbUrl) window.URL.revokeObjectURL(thumbUrl);
      };
    }, [message, thumbUrl]);

    const handlePreviewImage = async () => {
      try {
        const blob = await getFileData(message.message_id);
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      } catch (error) {
        console.error("Error previewing image:", error);
      }
    };

    return (
      <div
        className="w-24 h-24 bg-gray-100 rounded overflow-hidden cursor-pointer"
        onClick={handlePreviewImage}
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={message.file_name || "image"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-gray-500">
            Loading...
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border-b p-4 bg-white/95 shadow-sm flex items-center justify-between space-x-4">
      {/* Left Side: Group Avatar and Name */}
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
          <h2 className="font-semibold text-lg text-gray-900">
            {is_direct_message ? chat_info.otherUser?.username : group_name}
          </h2>
          {is_direct_message && (
            <Badge
              variant={isOnline ? "success" : "secondary"}
              className="text-xs"
            >
              {isOnline ? "Online" : "Offline"}
            </Badge>
          )}
        </div>
      </div>

      {/* Right Side: Sheet with Tabbed Content */}
      <div className="flex items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100 transition-colors"
            >
              <BsThreeDotsVertical className="h-5 w-5 text-gray-600" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[400px] p-0 border-l bg-white"
          >
            <Tabs defaultValue="home" className="w-full">
              <TabsList className="flex h-14 space-x-2 border-b bg-gray-50/50 p-2">
                <TabsTrigger
                  value="home"
                  className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Home
                </TabsTrigger>
                <TabsTrigger
                  value="files"
                  className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Files
                </TabsTrigger>
                <TabsTrigger
                  value="images"
                  className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Images
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Events
                </TabsTrigger>
              </TabsList>

              <TabsContent value="home" className="p-6 space-y-6">
                {is_direct_message ? (
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={chat_info.otherUser?.profilePicture} />
                      <AvatarFallback className="text-xl">
                        {chat_info.otherUser?.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold text-xl text-gray-900">
                      {chat_info.otherUser?.username}
                    </h4>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={chat_info.groupPicture} />
                        <AvatarFallback className="text-xl">
                          {group_name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h4 className="font-semibold text-xl text-gray-900">
                        {group_name}
                      </h4>
                    </div>
                    <div className="flex gap-3 justify-center">
                      {isAdmin ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleAdminLeave}
                          className="shadow-none"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Group
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleMemberLeave}
                        >
                          Leave Group
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddMembersOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Members
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-500">
                        Members ({chat_info?.members?.length || 0})
                      </h3>
                      <div className="h-[280px] rounded-lg border bg-gray-50/50 overflow-y-auto">
                        {(chat_info?.members || []).map(
                          (member: any, index: number) => (
                            <div
                              key={`member-${member.user_id}-${index}`}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={member.profilePicture} />
                                <AvatarFallback>
                                  {member.username[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {member.username}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {member.role}
                                </p>
                              </div>
                              {member.user_id === currentUserId ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleMemberLeave}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  Leave
                                </Button>
                              ) : (
                                isAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setMemberToRemove(member.user_id);
                                      setRemoveMemberOpen(true);
                                    }}
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="files" className="p-6">
                {filesLoading ? (
                  <div className="text-sm text-gray-500 text-center py-8">
                    Loading files...
                  </div>
                ) : fileMessages.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-8">
                    No files shared yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fileMessages.map((msg: any) => (
                      <div
                        key={msg.message_id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={async () => {
                          try {
                            const blob = await getFileData(msg.message_id);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = msg.file_name || "download";
                            a.click();
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error("Error downloading file:", error);
                          }
                        }}
                      >
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gray-100">
                          <FileIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {msg.file_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {msg.file_type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="images" className="p-6">
                {filesLoading ? (
                  <div className="text-sm text-gray-500 text-center py-8">
                    Loading images...
                  </div>
                ) : imageMessages.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-8">
                    No images shared yet
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {imageMessages.map((msg: any) => (
                      <GroupImageThumbnail key={msg.message_id} message={msg} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="p-6">
                {groupEvents.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-8">
                    No events scheduled yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupEvents.map((event: any) => (
                      <div
                        key={event.event_id}
                        className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow"
                      >
                        <h4 className="text-lg font-semibold">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString()} at{" "}
                          {event.time}
                        </p>
                        {event.location && (
                          <p className="text-sm text-gray-500">
                            Location: {event.location}
                          </p>
                        )}
                        {event.platform && (
                          <p className="text-sm text-gray-500">
                            Platform: {event.platform}
                          </p>
                        )}
                        {event.link && (
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 underline"
                          >
                            Join Event
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      </div>

      {/* Dialogs and Alerts */}
      <Dialog open={addMembersOpen} onOpenChange={setAddMembersOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Members</DialogTitle>
            <DialogDescription>
              Search and select users to add to this group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search users..."
                className="pl-9 border rounded p-2 w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsersHandler(e.target.value);
                }}
              />
            </div>
            <div className="h-[300px] rounded-lg border overflow-y-auto">
              {users.map((user: any) => (
                <div
                  key={`search-user-${user.user_id}`}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
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
                    className="mr-3"
                  />
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback>{user.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddMembers}
              disabled={selectedUsers.length === 0}
            >
              Add Selected Members
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Notification
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Confirm Group Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              You are an admin. Leaving the group will delete the group and
              remove all members. Do you wish to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-3">
            <AlertDialogCancel className="hover:bg-gray-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAdminLeave}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={removeMemberOpen} onOpenChange={setRemoveMemberOpen}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Confirm Member Removal
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to remove this member from the group? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-3">
            <AlertDialogCancel className="hover:bg-gray-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmMemberLeaveOpen}
        onOpenChange={setConfirmMemberLeaveOpen}
      >
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Confirm Leave Group
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to leave this group? You won't be able to
              access the chat history unless you're re-added.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-3">
            <AlertDialogCancel className="hover:bg-gray-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMemberLeave}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Leave Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

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
      onClick={() => {
        dispatch(clearChatSlice());
        dispatch(setChatDetails(chat));
      }}
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
          <div className="flex-1 w-44">
            <p className="text-sm text-muted-foreground truncate">
              {lastMsg?.sender === currentUser.username ? "You: " : ""}
              {lastMsg?.message_content || "No messages yet"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      // Create the chat group
      const groupResponse = await createOneonOneGroup(user.user_id);
      if (!groupResponse.success || !groupResponse.group) {
        throw new Error(`Failed to create chat with ${user.username}`);
      }
      // Construct the chat object
      const newChat: Chat = {
        ...groupResponse.group,
        group_name: user.username,
        chat_info: { otherUser: user, members: [user] },
        is_direct_message: true,
      };
      dispatch(setChatDetails(newChat));
      // Set a temporary last message
      dispatch(
        setLastMessage({
          groupID: newChat.group_id,
          lastMessage: {
            message_id: `temp-${Date.now()}`,
            sender: user.user_id,
            message_content: message,
            sent_at: new Date().toISOString(),
            group_id: newChat.group_id,
          },
        })
      );
      // Send the initial message to the server
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
      // Update with the real message from the server
      dispatch(
        setLastMessage({
          groupID: newChat.group_id,
          lastMessage: messageResponse.message,
        })
      );
      if (onChatCreated) onChatCreated();
      setShowCustomMessage(false);
    } catch (error) {
      console.error("Chat creation error:", error);
      alert(error instanceof Error ? error.message : "Failed to create chat");
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
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{" "}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
const ChatList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"explore" | "my-chat">("my-chat");
  const [search, setSearch] = useState<string>("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocketContext();
  const { chatDetails } = useSelector((state: any) => state.chat);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadChats = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllChatForUser();
        console.log(data)
        setChats(data.chats || []);
        if (data.chats?.length > 0) {
          socket.emit(
            "joinChat",
            data.chats.map((c: Chat) => c.group_id)
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
    const handleNewOrUpdatedMessage = (message: Message) => {
      dispatch(
        setLastMessage({ groupID: message.group_id, lastMessage: message })
      );
    };

    const handleDeleteMessage = ({
      message_id,
      group_id,
    }: {
      message_id: string;
      group_id: string;
    }) => {
      fetchAllChatForUser()
        .then((data) => {
          const chat = data.chats.find((c: Chat) => c.group_id === group_id);
          if (chat && chat.lastMessage) {
            dispatch(
              setLastMessage({
                groupID: group_id,
                lastMessage: chat.lastMessage,
              })
            );
          } else {
            dispatch(setLastMessage({ groupID: group_id, lastMessage: null }));
          }
        })
        .catch((err) =>
          console.error("Error recalculating last message:", err)
        );
    };

    socket.on("newMessage", handleNewOrUpdatedMessage);
    socket.on("updateMessage", handleNewOrUpdatedMessage);
    socket.on("deleteMessage", handleDeleteMessage);

    return () => {
      socket.off("newMessage", handleNewOrUpdatedMessage);
      socket.off("updateMessage", handleNewOrUpdatedMessage);
      socket.off("deleteMessage", handleDeleteMessage);
    };
  }, [socket, dispatch]);

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
        setUsers([]);
      }
    };
    const timeoutId = setTimeout(searchUsers, 500);
    return () => clearTimeout(timeoutId);
  }, [search, activeTab]);

  return (
    <div className="h-full flex flex-col border-r w-80 min-w-[320px]">
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
                  key={user.user_id}
                  user={user}
                  onChatCreated={() => {
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
