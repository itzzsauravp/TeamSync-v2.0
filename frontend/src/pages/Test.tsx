import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchGroupAndMembersDetail } from "@/api/groupApi";
import { Group, Member } from "@/types/main";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

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

const Test = ({ setSelectedGroup }) => {
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

  return adminGroups.length !== 0 ? (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminGroups.map((group) => (
          // <Link
          //   key={group.group_id}
          //   to={`/dashboard/group/${group.group_id}`}
          //   state={{ group }}
          // >
          <Card
            className="hover:shadow-lg transition-shadow duration-200 w-[300px] cursor-pointer"
            onClick={() => {
              setSelectedGroup(group);
            }}
          >
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
          // </Link>
        ))}
      </div>
    </div>
  ) : (
    <p className="text-lg text-center font-medium text-gray-600">
      You are not an admin in any group. Please create a group first.
    </p>
  );
};

export default Test;
