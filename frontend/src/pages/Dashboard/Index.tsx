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

const Index = () => {
  const [date, setDate] = useState(new Date());
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getAllGroupEvents();
        if (res.success) {
          const sortedEvents = res.groupEvents.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setUpcomingEvents(sortedEvents);
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
          <Calendar className="h-4 w-4" />{" "}
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
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              12 hours average time
            </p>
            <Progress value={45} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-muted-foreground">+4 since last week</p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 currently online</p>
            <Progress value={65} className="mt-2" />
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
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
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
                upcomingEvents.map((event) => (
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
              {[1, 2, 3, 4, 5].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 mb-4 p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">Update User Interface</p>
                      <Badge variant={i % 2 === 0 ? "default" : "secondary"}>
                        {i % 2 === 0 ? "In Progress" : "Review"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <Avatar className="h-6 w-6 border-2 border-background">
                          <AvatarImage src={`/api/placeholder/24/24`} />
                          <AvatarFallback>U1</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-6 w-6 border-2 border-background">
                          <AvatarImage src={`/api/placeholder/24/24`} />
                          <AvatarFallback>U2</AvatarFallback>
                        </Avatar>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Due in 2 days
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
