import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoSearch } from "react-icons/io5";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Calendar,
  ClipboardList,
  Loader2,
  Plus,
  Search,
  Edit,
  Trash2,
  Link as LinkIcon,
  MapPin,
  UserPlus,
  Mail,
  Phone,
  User,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { createGroupChat, addUserToGroup, deleteGroup } from "@/api/groupApi";
import {
  leaveGroup,
  removeMember,
  fetchAdminGroups,
} from "@/api/groupMemberApi";
import {
  createEvent,
  getEventsForUser,
  editEvent,
  deleteEvent,
} from "@/api/eventApi";
import { fetchUsers } from "@/api/userApi";
import { selectUser } from "@/store/userSlice";
import { cn } from "@/lib/utils";
import GroupTask from "@/components/GroupTask";

// =================== MEMBER POPOVER ===================
const MemberPopover = ({ user }: { user: any }) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="cursor-pointer flex items-center gap-2"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user.username}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 rounded-lg shadow-lg">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-semibold">{user.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span>
              {user.first_name} {user.last_name}
            </span>
          </div>
          {user.phone_number && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{user.phone_number}</span>
            </div>
          )}
          {user.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{user.address}</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// =================== ADMIN COMPONENT ===================
const Admin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser.user_id;

  // UI & Dialog States
  const [activeTab, setActiveTab] = useState("groups");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isManageGroupOpen, setIsManageGroupOpen] = useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Data States
  const [groups, setGroups] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Group-related State
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedMembersForRemoval, setSelectedMembersForRemoval] = useState<
    string[]
  >([]);
  const [manageGroup, setManageGroup] = useState<any>(null);

  // Event-related State
  const [eventDetails, setEventDetails] = useState({
    title: "",
    date: "",
    time: "00:00",
    location: "",
    link: "",
    platform: "",
    group_id: "",
  });

  // Delete & Alert Dialog State
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: "",
    id: "",
    name: "",
  });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // User Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Fallback messages
  const noGroupsMessage =
    "You are not an admin in any group. Please create a group first.";
  const noEventsMessage =
    groups.length === 0
      ? "You are not an admin in any group, so you cannot create events. Please create a group first."
      : "No events found. Create a new event for your group.";

  // ------------------- Fetching Data -------------------
  useEffect(() => {
    fetchGroupsAndEvents();
  }, []);

  useEffect(() => {
    const searchUsersAsync = async () => {
      if (searchQuery.trim()) {
        try {
          const data = await fetchUsers({ username: searchQuery });
          setUsers(data || []);
        } catch (err) {
          console.error("Error searching users:", err);
        }
      } else {
        setUsers([]);
      }
    };
    const timeoutId = setTimeout(searchUsersAsync, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchGroupsAndEvents = async () => {
    setIsLoading(true);
    try {
      const groupsData = await fetchAdminGroups();
      const eventsData = await getEventsForUser();
      setGroups(groupsData.groups || []);
      setEvents(eventsData.groupEvents || []);
    } catch (error) {
      console.error("Error fetching groups and events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------- Group CRUD -------------------
  // Create Group (button enabled only if at least 2 members selected)
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) return;
    setIsLoading(true);
    try {
      const groupResponse = await createGroupChat(groupName);
      await Promise.all(
        selectedUsers.map((userId) =>
          addUserToGroup(groupResponse.groupId, userId)
        )
      );
      await fetchGroupsAndEvents();
      setIsCreateGroupOpen(false);
      setGroupName("");
      setSelectedUsers([]);
      setSearchQuery("");
    } catch (error) {
      console.error("Group creation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: "group",
      id: groupId,
      name: groupName,
    });
  };

  // ------------------- Group Management Dialogs -------------------
  // Open Manage Group Dialog
  const openManageGroup = (group: any) => {
    setManageGroup(group);
    setIsManageGroupOpen(true);
    setSearchQuery("");
    setUsers([]);
    setSelectedUsers([]);
    setSelectedMembersForRemoval([]);
  };

  // Remove Selected Members from Group (multi-select)
  const handleRemoveSelectedMembers = async () => {
    if (selectedMembersForRemoval.length === 0) return;
    setIsLoading(true);
    try {
      await Promise.all(
        selectedMembersForRemoval.map((memberId) =>
          removeMember(manageGroup.group_id, memberId)
        )
      );
      setAlertMessage("Selected members removed successfully.");
      setAlertOpen(true);
      setTimeout(() => {
        setAlertOpen(false);
        navigate("/dashboard/admin");
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Error removing selected members:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------- Add Members Dialog -------------------
  const handleAddMembersToGroup = async () => {
    if (!manageGroup || selectedUsers.length === 0) return;
    setIsLoading(true);
    try {
      await Promise.all(
        selectedUsers.map((userId) =>
          addUserToGroup(manageGroup.group_id, userId)
        )
      );
      await fetchGroupsAndEvents();
      setIsAddMembersOpen(false);
    } catch (error) {
      console.error("Error adding members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------- Leave Group & Remove Member -------------------
  const handleAdminLeave = async () => {
    try {
      const response = await leaveGroup(manageGroup.group_id);
      if (response.success) {
        setAlertMessage(response.message || "You have left the group.");
        setAlertOpen(true);
        setTimeout(() => {
          setAlertOpen(false);
          navigate("/dashboard/admin");
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      console.error("Error leaving group:", err);
    }
  };

  // ------------------- Event CRUD -------------------
  const handleCreateOrUpdateEvent = async () => {
    if (
      !eventDetails.title.trim() ||
      !eventDetails.date ||
      !eventDetails.group_id
    )
      return;
    setIsLoading(true);
    try {
      if (editingEventId) {
        await editEvent(editingEventId, eventDetails);
      } else {
        await createEvent(eventDetails);
      }
      await fetchGroupsAndEvents();
      setIsCreateEventOpen(false);
      setEditingEventId(null);
      setEventDetails({
        title: "",
        date: "",
        time: "00:00",
        location: "",
        link: "",
        platform: "",
        group_id: "",
      });
    } catch (error) {
      console.error("Event creation/updating failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: "event",
      id: eventId,
      name: eventTitle,
    });
  };

  const handleEditEvent = (eventItem: any) => {
    setEditingEventId(eventItem.event_id);
    setEventDetails({
      title: eventItem.title,
      date: eventItem.date,
      time: eventItem.time.slice(0, 5),
      location: eventItem.location || "",
      link: eventItem.link || "",
      platform: eventItem.platform || "",
      group_id: eventItem.group_id,
    });
    setIsCreateEventOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      if (deleteConfirmation.type === "group") {
        await deleteGroup(deleteConfirmation.id);
      } else {
        await deleteEvent(deleteConfirmation.id);
      }
      await fetchGroupsAndEvents();
    } catch (error) {
      console.error(`Error deleting ${deleteConfirmation.type}:`, error);
    } finally {
      setIsLoading(false);
      setDeleteConfirmation({ isOpen: false, type: "", id: "", name: "" });
    }
  };

  const getGroupInfo = (groupId: string) =>
    groups.find((group) => group.group_id === groupId);

  // ------------------- GroupCard Component -------------------

  const GroupCard = ({ group }: { group: any }) =>
    group.groupMembers.length !== 2 && (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-left">
          <div>
            <CardTitle className="text-xl font-semibold">
              {group.groupMembers.length == 2
                ? "Direct Message (DM)"
                : group.group_name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Created on: {new Date(group.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="mt-2 sm:mt-0 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openManageGroup(group)}
            >
              <UserPlus className="h-4 w-4 mr-1" /> Manage
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                handleDeleteGroup(group.group_id, group.group_name)
              }
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-2 text-left">
            <span className="font-semibold text-gray-700">Members:</span>
            <ScrollArea className="mt-2 h-16">
              <div className="flex gap-4">
                {group.groupMembers.map((member: any) => (
                  <MemberPopover key={member.id} user={member.user} />
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    );

  // ------------------- EventCard Component -------------------
  const EventCard = ({ event }: { event: any }) => {
    const groupInfo = getGroupInfo(event.group_id);
    const eventDate = new Date(event.date);
    return (
      <Card className="hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="text-left">
          <CardTitle className="text-2xl font-bold">{event.title}</CardTitle>
          <CardDescription className="text-gray-600 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{eventDate.toLocaleDateString()}</span>
            <span className="text-gray-500">at</span>
            <span>{event.time.slice(0, 5)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-left">
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">Location:</span>
              <span>{event.location}</span>
            </div>
          )}
          {event.platform && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">Platform:</span>
              <span>{event.platform}</span>
            </div>
          )}
          {event.link && (
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">Link:</span>
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline break-all"
              >
                {event.link}
              </a>
            </div>
          )}
          {groupInfo && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 mt-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">Group:</span>
              <span>{groupInfo.group_name}</span>
            </div>
          )}
        </CardContent>
        <div className="flex justify-end p-4 space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditEvent(event)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteEvent(event.event_id, event.title)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </Card>
    );
  };

  // ------------------- Fallback UI -------------------
  const renderGroupsFallback = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-lg font-medium text-gray-600">{noGroupsMessage}</p>
      <Button onClick={() => setIsCreateGroupOpen(true)} className="mt-4">
        Create Group
      </Button>
    </div>
  );

  const renderEventsFallback = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-lg font-medium text-gray-600">{noEventsMessage}</p>
      {groups.length > 0 && (
        <Button onClick={() => setIsCreateEventOpen(true)} className="mt-4">
          Create Event
        </Button>
      )}
    </div>
  );

  // Determine if current user is admin in the group being managed.
  const isCurrentUserAdmin =
    manageGroup &&
    (manageGroup.groupMembers || []).some(
      (member: any) =>
        member.user_id === currentUserId && member.role === "admin"
    );

  // ------------------- Render -------------------
  return (
    <div className="container mx-auto p-6 space-y-8">
      <Tabs defaultValue="groups" className="space-y-6">
        <TabsList>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Groups
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Events
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Tasks
          </TabsTrigger>
        </TabsList>

        {/* GROUPS TAB */}
        <TabsContent value="groups">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold">My Groups (Admin)</h2>
              <p className="text-gray-600 mt-1">
                Manage your groups and add members easily.
              </p>
            </div>
            <Button
              onClick={() => setIsCreateGroupOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create Group
            </Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : groups.length === 0 ? (
            renderGroupsFallback()
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <GroupCard key={group.group_id} group={group} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* EVENTS TAB */}
        <TabsContent value="events">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold">My Events</h2>
              <p className="text-gray-600 mt-1">
                Create, update, and delete events for your groups.
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingEventId(null);
                setEventDetails({
                  title: "",
                  date: "",
                  time: "00:00",
                  location: "",
                  link: "",
                  platform: "",
                  group_id: "",
                });
                setIsCreateEventOpen(true);
              }}
              className="flex items-center gap-2"
              disabled={groups.length === 0}
            >
              <Plus className="h-4 w-4" /> Create Event
            </Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : events.length === 0 ? (
            renderEventsFallback()
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.event_id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* TASKS TAB */}
        <TabsContent value="tasks">
          <GroupTask />
        </TabsContent>
      </Tabs>

      {/* CREATE GROUP DIALOG */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-lg p-6">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Give your group a name and add at least <strong>2 members</strong>{" "}
              to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="groupName" className="text-sm font-medium">
                Group Name
              </label>
              <Input
                id="groupName"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="searchUsers" className="text-sm font-medium">
                Add Members
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="searchUsers"
                  placeholder="Search users..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-100 rounded-md px-2"
                    onClick={() => {
                      const isSelected = selectedUsers.includes(user.user_id);
                      const newSelected = isSelected
                        ? selectedUsers.filter((id) => id !== user.user_id)
                        : [...selectedUsers, user.user_id];
                      setSelectedUsers(newSelected);
                    }}
                  >
                    <Checkbox
                      checked={selectedUsers.includes(user.user_id)}
                      onCheckedChange={() => {
                        const isSelected = selectedUsers.includes(user.user_id);
                        const newSelected = isSelected
                          ? selectedUsers.filter((id) => id !== user.user_id)
                          : [...selectedUsers, user.user_id];
                        setSelectedUsers(newSelected);
                      }}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback>
                        {user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-2">
                      <p className="text-sm font-medium">{user.username}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Start typing to search for users
                </p>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateGroup}
              disabled={isLoading || selectedUsers.length < 2}
              className="rounded-md"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MANAGE GROUP DIALOG */}
      <Dialog open={isManageGroupOpen} onOpenChange={setIsManageGroupOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-lg p-6">
          <DialogHeader>
            <DialogTitle>Manage Group: {manageGroup?.group_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col items-center">
              <Avatar className="h-20 w-20">
                <AvatarImage src={manageGroup?.groupPicture} />
                <AvatarFallback>
                  {manageGroup?.group_name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h4 className="mt-2 font-semibold text-xl">
                {manageGroup?.group_name}
              </h4>
            </div>
            {/* Top Buttons: Leave Group & Add Members */}
            <div className="flex justify-between">
              {isCurrentUserAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdminLeave}
                  className="rounded-md px-3"
                >
                  Leave Group (Delete)
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddMembersOpen(true)}
                className="rounded-md"
              >
                Add Members
              </Button>
            </div>
            {/* Member List with checkboxes for removal */}
            <div className="w-full">
              <h3 className="font-medium mb-2">
                Members ({manageGroup?.groupMembers?.length || 0})
              </h3>
              <ScrollArea className="h-64 border rounded-md">
                {(manageGroup?.groupMembers || []).map((member: any) => (
                  <div
                    key={member.id}
                    className={cn(
                      "flex items-center gap-3 py-2 px-2 border-b last:border-b-0",
                      member.user_id === currentUserId && "bg-green-50"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user.profilePicture} />
                      <AvatarFallback>
                        {member.user.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="capitalize font-semibold">
                        {member.user.username}
                      </h4>
                      <span
                        className={cn(
                          "text-sm",
                          member.role === "admin"
                            ? "font-bold text-gray-800"
                            : "font-normal text-gray-600"
                        )}
                      >
                        {member.role}
                      </span>
                    </div>
                    {member.user_id !== currentUserId && isCurrentUserAdmin && (
                      <Checkbox
                        checked={selectedMembersForRemoval.includes(
                          member.user_id
                        )}
                        onCheckedChange={() => {
                          const isSelected = selectedMembersForRemoval.includes(
                            member.user_id
                          );
                          const newSelected = isSelected
                            ? selectedMembersForRemoval.filter(
                                (id) => id !== member.user_id
                              )
                            : [...selectedMembersForRemoval, member.user_id];
                          setSelectedMembersForRemoval(newSelected);
                        }}
                      />
                    )}
                  </div>
                ))}
              </ScrollArea>
              {isCurrentUserAdmin && selectedMembersForRemoval.length > 0 && (
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveSelectedMembers}
                    className="rounded-md w-full"
                  >
                    <Trash2 className="h-4 w-4 text-red-500 mr-2" /> Remove
                    Selected Members
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADD MEMBERS DIALOG (from Manage Group) */}
      <Dialog open={isAddMembersOpen} onOpenChange={setIsAddMembersOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-lg p-6">
          <DialogHeader>
            <DialogTitle>Add Members to {manageGroup?.group_name}</DialogTitle>
            <DialogDescription>
              Search and select users to add. Only users not already in the
              group are shown.
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
                  (async () => {
                    try {
                      const data = await fetchUsers({
                        username: e.target.value,
                      });
                      setUsers(
                        data.filter(
                          (user: any) =>
                            !manageGroup?.groupMembers.some(
                              (m: any) => m.user.user_id === user.user_id
                            )
                        ) || []
                      );
                    } catch (error) {
                      console.error("Error searching users:", error);
                    }
                  })();
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
              onClick={handleAddMembersToGroup}
              disabled={selectedUsers.length === 0}
              className="rounded-md"
            >
              Add Selected Members
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE / EDIT EVENT DIALOG */}
      <Dialog
        open={isCreateEventOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateEventOpen(false);
            setEditingEventId(null);
            setEventDetails({
              title: "",
              date: "",
              time: "00:00",
              location: "",
              link: "",
              platform: "",
              group_id: "",
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] rounded-lg p-6">
          <DialogHeader>
            <DialogTitle>
              {editingEventId ? "Edit Event" : "Create New Event"}
            </DialogTitle>
            <DialogDescription>
              {editingEventId
                ? "Update the event details"
                : "Schedule a new event for your group"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="eventTitle" className="text-sm font-medium">
                Event Title
              </label>
              <Input
                id="eventTitle"
                placeholder="Enter event title"
                value={eventDetails.title}
                onChange={(e) =>
                  setEventDetails({ ...eventDetails, title: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="eventDate" className="text-sm font-medium">
                  Date
                </label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDetails.date}
                  onChange={(e) =>
                    setEventDetails({ ...eventDetails, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="eventTime" className="text-sm font-medium">
                  Time
                </label>
                <Input
                  id="eventTime"
                  type="time"
                  value={eventDetails.time}
                  onChange={(e) =>
                    setEventDetails({ ...eventDetails, time: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="eventLocation" className="text-sm font-medium">
                Location
              </label>
              <Input
                id="eventLocation"
                placeholder="Enter location"
                value={eventDetails.location}
                onChange={(e) =>
                  setEventDetails({ ...eventDetails, location: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="eventPlatform" className="text-sm font-medium">
                Platform (optional)
              </label>
              <Input
                id="eventPlatform"
                placeholder="e.g., Zoom, Teams"
                value={eventDetails.platform}
                onChange={(e) =>
                  setEventDetails({ ...eventDetails, platform: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="eventLink" className="text-sm font-medium">
                Link (optional)
              </label>
              <Input
                id="eventLink"
                placeholder="Enter event link"
                value={eventDetails.link}
                onChange={(e) =>
                  setEventDetails({ ...eventDetails, link: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="eventGroup" className="text-sm font-medium">
                Select Group
              </label>
              <select
                id="eventGroup"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={eventDetails.group_id}
                onChange={(e) =>
                  setEventDetails({ ...eventDetails, group_id: e.target.value })
                }
              >
                <option value="">Select a group</option>
                {groups.map((group) => (
                  <option key={group.group_id} value={group.group_id}>
                    {group.group_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateOrUpdateEvent}
              disabled={isLoading}
              className="rounded-md"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingEventId ? "Update Event" : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation({ ...deleteConfirmation, isOpen })
        }
      >
        <AlertDialogContent className="rounded-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteConfirmation.type}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the{" "}
              {deleteConfirmation.type === "group" ? "group" : "event"} "
              {deleteConfirmation.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 rounded-md"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ALERT DIALOG */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="rounded-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Notification</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
