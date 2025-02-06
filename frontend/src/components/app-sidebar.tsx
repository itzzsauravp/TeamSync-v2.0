import * as React from "react";
import {
  Kanban,
  Home,
  AlarmClockCheck,
  MessageCircleMore,
  GalleryVerticalEnd,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "Saurav Parajulee",
    email: "social.saurav2003@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Team Sync",
      logo: GalleryVerticalEnd,
      plan: "Dashboard",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Messages",
      url: "message",
      icon: MessageCircleMore,
      isActive: true,
    },
    {
      title: "Tasks",
      url: "task",
      icon: AlarmClockCheck,
      isActive: true,
    },
    {
      title: "Kanban",
      url: "kanban",
      icon: Kanban,
      isActive: true,
    },
    {
      title: "Admin",
      url: "admin",
      icon: ShieldCheck,
      isActive: true,
    },
    {
      title: "Settings",
      url: "settings",
      icon: Settings2,
      isActive: true,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
