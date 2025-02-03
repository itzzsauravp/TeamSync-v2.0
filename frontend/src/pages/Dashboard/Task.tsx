import { Plus, Search, CheckCircle2, Clock, ArrowUpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const Task = () => {
  // Mock data for tasks
  const tasks = [
    {
      id: 1,
      title: "Implement New Dashboard Features",
      description: "Add analytics charts and improve overall performance",
      difficulty: "hard",
      status: "in-progress",
      assignee: "Alex Turner",
      dueDate: "2025-02-10",
      priority: "high",
      group: "Development"
    },
    {
      id: 2,
      title: "Update User Documentation",
      description: "Review and update all user guides for the new release",
      difficulty: "medium",
      status: "todo",
      assignee: "Sarah Chen",
      dueDate: "2025-02-15",
      priority: "medium",
      group: "Documentation"
    },
    {
      id: 3,
      title: "Bug Fixes in Authentication",
      description: "Address reported security vulnerabilities",
      difficulty: "hard",
      status: "completed",
      assignee: "Mike Ross",
      dueDate: "2025-02-08",
      priority: "critical",
      group: "Security"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage and track your team's tasks</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Create New Task
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search tasks..."
            className="w-full"
            prefix={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Categories */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
          <TabsTrigger value="created">Created by Me</TabsTrigger>
          <TabsTrigger value="watching">Watching</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* To Do Column */}
            <Card>
              <CardHeader className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  To Do
                  <Badge variant="secondary" className="ml-auto">3</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {tasks.map(task => (
                    <Card key={task.id} className="mb-4 cursor-pointer hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={
                            task.difficulty === 'hard' ? 'destructive' :
                            task.difficulty === 'medium' ? 'default' : 'secondary'
                          }>
                            {task.difficulty}
                          </Badge>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="/api/placeholder/32/32" />
                            <AvatarFallback>AT</AvatarFallback>
                          </Avatar>
                        </div>
                        <h3 className="font-semibold mb-1">{task.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {task.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{task.group}</span>
                          <span>Due {task.dueDate}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* In Progress Column */}
            <Card>
              <CardHeader className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
                  In Progress
                  <Badge variant="secondary" className="ml-auto">2</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {/* Similar task cards as above */}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Completed Column */}
            <Card>
              <CardHeader className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  Completed
                  <Badge variant="secondary" className="ml-auto">5</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {/* Similar task cards as above */}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other tab contents would be similar */}
      </Tabs>
    </div>
  );
};

export default Task;