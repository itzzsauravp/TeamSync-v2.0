import { useEffect, useState } from "react";
import { CheckCircle, Clock, Users, Calendar, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { getAllGroupEvents } from "@/api/eventApi";
import { fetchAllChatForUser } from "@/api/groupApi";
import { listUserTasksApi, listGroupTasksApi } from "@/api/taskApi";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/userSlice";
import { cn } from "@/lib/utils";
const Index = () => {
  const [date, setDate] = useState(new Date());
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [usersTasks, setUsersTasks] = useState([]);
  const { user_id, skillLevel } = useSelector(selectUser);
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getAllGroupEvents();
        setUpcomingEvents(res);
        const resp = await listUserTasksApi(user_id);
        console.log(resp.data.tasks);
        if (resp.success) {
          setUsersTasks(resp.data.tasks);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetchAllChatForUser();
        if (res.success) {
          setRecentChats(res.chats || []);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, []);
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, Team!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening today.
          </p>
        </div>
        <Button className="gap-2">
          <Calendar className="h-4 w-4" /> {date.getDate()}{" "}
          {date.toLocaleString("default", { month: "long" })}{" "}
          {date.getFullYear()}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Tasks assigned to you
            </p>
            <Progress value={usersTasks.length} max={10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usersTasks.filter((item) => item.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Your pending tasks</p>
            <Progress
              value={
                usersTasks.filter((item) => item.status === "pending").length
              }
              max={10}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usersTasks.filter((item) => item.status === "complete").length}
            </div>
            <p className="text-xs text-muted-foreground">You have completed</p>
            <Progress
              value={
                usersTasks.filter((item) => item.status === "complete").length
              }
              max={10}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Skill Level</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skillLevel || 0}</div>
            <p className="text-xs text-muted-foreground">
              Your current skill level
            </p>
            <Progress value={skillLevel || 0} max={5} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Calendar Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Team Calendar</CardTitle>
            <CardDescription>Manage your schedule and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <CalendarComponent mode="single" className="rounded-md border" />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your schedule for upcoming events</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {upcomingEvents.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8">
                  No events found.
                </div>
              ) : (
                upcomingEvents.groupEvents.map((event) => (
                  <div
                    key={event.event_id}
                    className="mb-4 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{event.title}</h4>
                      <Badge variant="default">Event</Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Clock className="h-4 w-4 mr-2" />
                      {event.time}
                    </div>
                    {event.location && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <span>Location: {event.location}</span>
                      </div>
                    )}
                    {event.platform && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <span>Platform: {event.platform}</span>
                      </div>
                    )}
                    {event.link && (
                      <div className="mt-1">
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 underline"
                        >
                          Join Event
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Conversations Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
            <CardDescription>Latest messages from your teams</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {recentChats.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8">
                  No recent conversations.
                </div>
              ) : (
                recentChats.map((chat) => (
                  <div
                    key={chat.group_id}
                    className="flex items-center gap-4 mb-4 p-2 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    <Avatar>
                      <AvatarImage src={`/api/placeholder/32/32`} />
                      <AvatarFallback>
                        {chat.group_name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{chat.group_name}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(chat.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Tasks Overview remains unchanged */}
        <Card>
          <CardHeader>
            <CardTitle>Current Tasks</CardTitle>
            <CardDescription>Track your team's progress</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {usersTasks.map(
                (task, i) =>
                  task.status === "pending" && (
                    <Card
                      key={i}
                      className="mb-4 p-4 hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="flex flex-col items-start">
                        <CardTitle className="flex items-center justify-between w-full">
                          <span>{task.task_name}</span>
                          <Badge
                            variant={
                              task.status === "pending"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {task.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{task.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-between text-sm text-muted-foreground">
                        <span
                          className={cn(
                            new Date().getTime() >=
                              new Date(task.due_date).getTime() &&
                              "text-red-500"
                          )}
                        >
                          Due on {new Date(task.due_date).toLocaleDateString()}{" "}
                          {new Date().getTime() >=
                            new Date(task.due_date).getTime() && (
                            <span className="font-bold">
                              (Deadline crossed)
                            </span>
                          )}
                        </span>
                      </CardContent>
                    </Card>
                  )
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
