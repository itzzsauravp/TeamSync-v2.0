import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { fetchGroupAndMembersDetail } from "@/api/groupApi";
import { Group, Member } from "@/types/main";

const MemberItem = ({ member }: { member: Member }) => {
  const { user } = member;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center">
          <img
            src={user.profilePicture}
            alt={user.username}
            className="h-10 w-10 rounded-full"
          />
          <span className="text-xs">{user.username}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="p-2">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Expertise:</strong> {user.userExpertise}
          </p>
          <p>
            <strong>Skill Level:</strong> {user.skillLevel || "N/A"}
          </p>
          <p>
            <strong>Availability:</strong>{" "}
            {user.userBusyUntill ? user.userBusyUntill : "N/A"}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

const GroupDetailDialog = ({ group }: { group: any }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <Card className="hover:shadow-lg transition-shadow duration-200 w-[300px]">
            <CardHeader className="flex flex-col justify-between items-start text-left">
              <div>
                <CardTitle className="text-xl font-semibold">
                  {group.members.length === 2
                    ? "Direct Message (DM)"
                    : group.group_name}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Created on: {new Date(group.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2 text-left">
                <span className="font-semibold text-gray-700">Members:</span>
                <ScrollArea className="mt-2 h-16">
                  <div className="flex gap-4">
                    {group.members.map((member: any) => (
                      <MemberItem key={member.id} member={member} />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogTrigger>
      <DialogContent className="p-4 h-[60%] max-w-[60%]">
        <DialogHeader>
          <DialogTitle>{group.group_name}</DialogTitle>
          <DialogDescription>
            Group created on: {new Date(group.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Side: Detailed member info */}
          <div className="md:w-1/3 w-full border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto p-4">
            <h3 className="text-lg font-semibold mb-4">Members Detail</h3>
            <div className="space-y-4">
              {group.members.map((member: Member) => (
                <Tooltip key={member.id}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center p-2 border rounded hover:bg-gray-50">
                      <img
                        src={member.user.profilePicture}
                        alt={member.user.username}
                        className="h-10 w-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-semibold">{member.user.username}</p>
                        <p className="text-sm text-gray-500">
                          Role: {member.role}
                        </p>
                        <p className="text-sm">
                          <strong>Expertise:</strong>{" "}
                          {member.user.userExpertise}
                        </p>
                        <p className="text-sm">
                          <strong>Skill Level:</strong>{" "}
                          {member.user.skillLevel || "N/A"}
                        </p>
                        <p className="text-sm">
                          <strong>Availability:</strong>{" "}
                          {member.user.userBusyUntill
                            ? member.user.userBusyUntill
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="p-2">
                      <p>
                        <strong>Email:</strong> {member.user.email}
                      </p>
                      <p>
                        <strong>Address:</strong> {member.user.address || "N/A"}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
          {/* Right Side: Placeholder for additional details */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="h-full border border-dashed border-gray-300 flex items-center justify-center">
              <span className="text-gray-500">Additional details go here.</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Test = () => {
  const [adminGroups, setAdminGroups] = useState<Group[]>([]);

  useEffect(() => {
    const foo = async () => {
      const { data } = await fetchGroupAndMembersDetail();
      if (data?.groups) {
        setAdminGroups(data.groups);
      }
    };
    foo();
  }, []);

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminGroups.map((group) => (
          <GroupDetailDialog key={group.group_id} group={group} />
        ))}
      </div>
    </div>
  );
};

export default Test;
