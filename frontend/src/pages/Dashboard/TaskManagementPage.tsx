import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Member } from "@/types/main";
import { listGroupTasksApi } from "@/api/taskApi";
import { updateWeights } from "@/api/groupApi";

const weightLabels = [
  "Skill",
  "Experties",
  "Task Priority",
  "User Availability",
];

const TaskManagementPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // The group is passed via the router's location state
  const { group } = location.state as { group: any };

  const [tasks, setTasks] = useState<any[]>([]);
  const [weights, setWeights] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);

  // Parse weights from the group (if present)
  useEffect(() => {
    if (group && group.weight) {
      const parsed = group.weight.split(",").map((w: string) => parseFloat(w));
      setWeights(parsed);
    }
  }, [group]);

  // Fetch tasks for the given group_id
  useEffect(() => {
    if (group && group.group_id) {
      const fetchTasks = async () => {
        setLoadingTasks(true);
        try {
          const { data } = await listGroupTasksApi(group.group_id);
          if (data) {
            setTasks(data);
          }
        } catch (err) {
          console.error("Error fetching tasks", err);
        } finally {
          setLoadingTasks(false);
        }
      };
      fetchTasks();
    }
  }, [group]);

  // Handler for slider change for a specific weight
  const handleWeightChange = (index: number, newValue: number) => {
    const newWeights = [...weights];
    newWeights[index] = newValue;
    setWeights(newWeights);
  };

  // Save the updated weights
  const handleSaveWeights = async () => {
    const total = weights.reduce((acc, cur) => acc + cur, 0);
    if (total > 1) {
      setError("The weights cannot be more than 1 when summed up.");
      return;
    }
    setError(null);
    const weightString = weights.join(",");
    try {
      await updateWeights(group.group_id, weightString);
      alert("Weights updated successfully!");
    } catch (err) {
      console.error("Error updating weights", err);
      alert("Error updating weights");
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Navigation & Header */}
      <div>
        <Button onClick={() => navigate("/dashboard/group")} className="mb-4">
          Back
        </Button>
        <h1 className="text-2xl font-bold">{group.group_name}</h1>
        <p className="text-gray-600">
          Group created on: {new Date(group.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Grid: First Row with User Details and Tasks Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Details Section wrapped in a scrollable area */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Group Members</h3>
          <ScrollArea className="h-96 rounded border">
            <div className="space-y-4 p-2">
              {group.members.map((member: Member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 p-2 border-b last:border-b-0"
                >
                  <img
                    src={member.user.profilePicture}
                    alt={member.user.username}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="text-sm">
                    <p className="font-medium">{member.user.username}</p>
                    <p>Email: {member.user.email}</p>
                    <p>Skill Level: {member.user.skillLevel ?? "N/A"}</p>
                    <p>Expertise: {member.user.userExpertise ?? "N/A"}</p>
                    <p>
                      Busy Until:{" "}
                      {member.user.userBusyUntill
                        ? new Date(
                            member.user.userBusyUntill
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Tasks Table Section with elegant styling */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Tasks</h3>
          {loadingTasks ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p>No tasks available</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border shadow">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Task Name
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Skill Level
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Estimated Time
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Due Date
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Priority
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Progress
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Expertise
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task: Task) => (
                    <TableRow key={task.task_id}>
                      <TableCell
                        className="px-4 py-2 truncate"
                        title={task.task_name}
                      >
                        {task.task_name}
                      </TableCell>
                      <TableCell
                        className="px-4 py-2 line-clamp-2"
                        title={task.description}
                      >
                        {task.description}
                      </TableCell>
                      <TableCell
                        className="px-4 py-2"
                        title={task.taskSkillLevel}
                      >
                        {task.taskSkillLevel}
                      </TableCell>
                      <TableCell
                        className="px-4 py-2"
                        title={task.estimated_time}
                      >
                        {task.estimated_time}
                      </TableCell>
                      <TableCell
                        className="px-4 py-2"
                        title={
                          task.due_date
                            ? new Date(task.due_date).toLocaleDateString()
                            : "-"
                        }
                      >
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell
                        className="px-4 py-2"
                        title={task.taskPriority}
                      >
                        {task.taskPriority}
                      </TableCell>
                      <TableCell className="px-4 py-2" title={task.progress}>
                        {task.progress}
                      </TableCell>
                      <TableCell
                        className={`px-4 py-2 rounded-full ${
                          task.status === "ongoing"
                            ? "bg-gray-500"
                            : task.status === "pending"
                            ? "text-purple-500"
                            : task.status === "aborted"
                            ? "bg-red-500"
                            : task.status === "completed"
                            ? "bg-green-500"
                            : task.status === "delayed"
                            ? "bg-black text-white"
                            : ""
                        }`}
                        title={task.status}
                      >
                        {task.status}
                      </TableCell>
                      <TableCell
                        className="px-4 py-2"
                        title={task.taskExpertise}
                      >
                        {task.taskExpertise}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Weights Section with a fixed width */}
      <div className="mt-6 p-4 border rounded w-64 mx-auto">
        <div>
          <h3 className="text-lg font-semibold mb-2">Weights</h3>
          <div className="space-y-4">
            {weights.map((weight, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="w-32 text-sm">
                  {weightLabels[index] || `Weight ${index + 1}`}
                </span>
                <Slider
                  value={[weight]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(val: number[]) =>
                    handleWeightChange(index, val[0])
                  }
                />
                <span className="w-12 text-sm">{weight.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Button onClick={handleSaveWeights} className="mt-2 w-full">
            Save Weights
          </Button>
          {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default TaskManagementPage;
