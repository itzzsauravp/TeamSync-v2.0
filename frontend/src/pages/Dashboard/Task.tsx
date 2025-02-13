import { useEffect, useState } from "react";
import { listAllGroupsTasks, listUserTasksApi } from "@/api/taskApi";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import TaskCard from "@/components/ui/taskcard";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/userSlice";

const Task = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user_id } = useSelector(selectUser);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await listAllGroupsTasks();
        const response = await listUserTasksApi(user_id);
        setAllTasks(data);
        setMyTasks(response.data.tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [user_id]);

  const filterTasks = (tasks) => {
    return tasks.filter((task) => {
      const matchesSearch = task.task_name
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        task.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  };

  const filteredMyTasks = filterTasks(myTasks);
  const filteredAllTasks = filterTasks(allTasks);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your team's tasks
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-[300px]">
          <Input
            placeholder="Search tasks..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<Search className="h-4 w-4" />}
          />
        </div>
        <div>
          <Select defaultValue="all" onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="aborted">Aborted</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="assigned-to-me" className="w-full">
        <TabsList>
          <TabsTrigger value="assigned-to-me">Assigned to Me</TabsTrigger>
          <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned-to-me" className="mt-6">
          {filteredMyTasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredMyTasks.map((task) => (
                <TaskCard key={task.task_id} task={task} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No tasks assigned to you yet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="all-tasks" className="mt-6">
          {filteredAllTasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredAllTasks.map((task) => (
                <TaskCard key={task.task_id} task={task} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No tasks found.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Task;
