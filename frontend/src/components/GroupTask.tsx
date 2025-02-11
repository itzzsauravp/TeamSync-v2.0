import React, { useEffect, useState } from "react";
import { fetchAllGroups } from "../api/groupApi";
import { fetchAdminGroups } from "../api/groupMemberApi";
import main from "../../../algo.js";
import { listGroupTasksApi, createTaskApi } from "../api/taskApi.js";

// Import shadcn UI components (adjust the import paths based on your project setup)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CloudCog } from "lucide-react";

// Define a Group type based on the API response
interface Group {
  group_id: string;
  group_name: string;
}

// Define a Task type (keys match the backend response)
interface Task {
  id: string;
  task_name: string;
  due_date: string; // Expected in YYYY-MM-DD format
  difficulty: "easy" | "mid" | "hard";
  assigned: boolean;
}

const GroupTask: React.FC = () => {
  // Group selection state
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [assignmentResult, setAssignmentResult] = useState<any[]>([]);

  // Task state and form fields
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<"easy" | "mid" | "hard">("easy");
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState<boolean>(false);
  

  // for adding task
const [newTaskSkillLevel, setNewTaskSkillLevel] = useState(1);
const [newTaskPriority, setNewTaskPriority] = useState(1);
const [newTaskExpertise, setNewTaskExpertise] = useState("");
const [newTaskDescription, setNewTaskDescription] = useState("");


  // Load groups when the component mounts
  useEffect(() => {
    const loadGroups = async () => {
      try {
        let data = await fetchAdminGroups()
        data = data.groups.filter(item => item.groupMembers.length !== 2);
        console.log(data)
        
        if (data && Array.isArray(data)) {
          setGroups(data);
        } else {
          console.error("Unexpected data format from fetchAllGroups", data);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    };
    loadGroups();
  }, []);

  // Handle group selection
  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    setIsGroupDialogOpen(false);
  };

  // Load group members using the API response structure
  useEffect(() => {
    if (selectedGroup) {
      const loadGroupMembers = async () => {
        try {
          const groupsData = await fetchAdminGroups();
          console.log(groupsData)
          const groupObj = groupsData.groups.find((x: any) => x.group_id === selectedGroup.group_id);
          if (groupObj && groupObj.groupMembers) {
            setGroupMembers(groupObj.groupMembers);
          }
        } catch (error) {
          console.error("Error fetching group members:", error);
        }
      };
      loadGroupMembers();
    }
  }, [selectedGroup]);

  // Load tasks associated with the selected group
  useEffect(() => {
    if (selectedGroup) {
      const loadGroupTasks = async () => {
        try {
          const result = await listGroupTasksApi(selectedGroup.group_id);
          if (result.success) {
            setTasks(result.data);
          } else {
            console.error("Error fetching group tasks", result.error);
          }
        } catch (error) {
          console.error("Error fetching group tasks:", error);
        }
      };
      loadGroupTasks();
    }
  }, [selectedGroup]);

  // Handle new task submission
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validate that all required fields are filled and that a group is selected
    if (
      !newTaskName ||
      !newTaskSkillLevel ||
      !newTaskDeadline ||
      !newTaskDifficulty ||
      !newTaskPriority ||
      !newTaskExpertise ||
      !newTaskDescription ||
      !selectedGroup?.group_id
    ) {
      alert("Please fill in all fields.");
      return;
    }
  
    // Build the task payload using the new schema
    const taskPayload = {
      task_name: newTaskName,
      taskSkillLevel: Number(newTaskSkillLevel),
      group_id: selectedGroup.group_id,
      estimated_time:1, // remind me to remove this,
      due_date: newTaskDeadline,
      difficulty: newTaskDifficulty, // Assuming the backend accepts "easy", "mid", "hard" as is
      taskPriority: Number(newTaskPriority),
      taskExpertise: newTaskExpertise,
      description: newTaskDescription,
    };
  
    try {
      const result = await createTaskApi(taskPayload);
      if (result.success) {
        setTasks((prev) => [...prev, result.data]);
      } else {
        alert("Error adding task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Error adding task");
    }
  
    // Reset form fields
    setNewTaskName("");
    setNewTaskSkillLevel(1);
    setNewTaskDeadline("");
    setNewTaskDifficulty("easy");
    setNewTaskPriority(1);
    setNewTaskExpertise("");
    setNewTaskDescription("");
    setIsTaskDialogOpen(false);
  };
  
/*   const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName || !newTaskDeadline || !newTaskDifficulty) return;

    const taskPayload = {
      task_name: newTaskName,
      group_id: selectedGroup?.group_id,
      due_date: newTaskDeadline,
      // Map "mid" to "medium" if needed by the backend
      difficulty: newTaskDifficulty === "mid" ? "medium" : newTaskDifficulty,
      estimated_time: parseInt(newTaskEstimatedTime, 10),
    };

    const result = await createTaskApi(taskPayload);
    if (result.success) {
      setTasks((prev) => [...prev, result.data]);
    } else {
      alert("Error adding task");
    }
    setNewTaskName("");
    setNewTaskDeadline("");
    setNewTaskDifficulty("easy");
    setNewTaskEstimatedTime("");
    setIsTaskDialogOpen(false);
  }; */

  // Handle task assignment
  const handleAssignTasks = () => {
    const unassignedTasks = tasks.filter((task) => !task.assigned);
    if (groupMembers.length === 0 || unassignedTasks.length === 0) {
      alert("Not enough group members or tasks to assign.");
      return;
    }

    // Create a cost matrix factoring in difficulty and deadline
    const costMatrix = groupMembers.map((_, i) =>
      unassignedTasks.map((task) => {
        const diffMap = { easy: 1, mid: 2, hard: 3 };
        const difficultyCost = diffMap[task.difficulty] || 1;
        const now = new Date();
        const deadlineDate = new Date(task.due_date);
        const timeRemainingDays = Math.max(
          (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          0
        );
        return difficultyCost + timeRemainingDays;
      })
    );
    console.log("Cost Matrix:", costMatrix);
    const assignment = main(costMatrix);
    setAssignmentResult(assignment);
    console.log("Assignment Result:", assignment);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {selectedGroup ? (
        <div>
          {/* Selected Group Header */}
          <div className="mb-6 flex items-center justify-between bg-white p-4 rounded shadow">
            <div className="flex items-center">
              <CloudCog className="w-6 h-6 mr-2 text-blue-500" />
              <div>
                <h2 className="text-xl font-bold">Selected Group</h2>
                <p className="text-gray-600">{selectedGroup.group_name}</p>
              </div>
            </div>
            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="primary">Change Group</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select a Group</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-2">
                  {loading ? (
                    <p>Loading groups...</p>
                  ) : (
                    groups.map((group) => (
                      <Button
                        key={group.group_id}
                        onClick={() => handleGroupSelect(group)}
                        variant="outline"
                        className="w-full"
                      >
                        {group.group_name || "Unnamed Group"}
                      </Button>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Add Task Dialog */}
          <div className="mb-4">
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">Add Task</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTaskSubmit} className="space-y-4 mt-4">
  <div>
    <Label htmlFor="taskName" className="block mb-1">Task Name</Label>
    <Input
      id="taskName"
      type="text"
      value={newTaskName}
      onChange={(e) => setNewTaskName(e.target.value)}
      className="w-full"
    />
  </div>
  <div>
    <Label htmlFor="taskSkillLevel" className="block mb-1">Task Skill Level</Label>
    <Input
      id="taskSkillLevel"
      type="number"
      value={newTaskSkillLevel}
      onChange={(e) => setNewTaskSkillLevel(e.target.value)}
      className="w-full"
    />
  </div>
  <div>
    <Label htmlFor="dueDate" className="block mb-1">Due Date</Label>
    <Input
      id="dueDate"
      type="date"
      value={newTaskDeadline}
      onChange={(e) => setNewTaskDeadline(e.target.value)}
      className="w-full"
    />
  </div>
  <div>
    <Label htmlFor="difficulty" className="block mb-1">Difficulty</Label>
    <select
      id="difficulty"
      value={newTaskDifficulty}
      onChange={(e) => setNewTaskDifficulty(e.target.value as "easy" | "mid" | "hard")}
      className="border px-4 py-2 rounded w-full"
    >
      <option value="easy">Easy</option>
      <option value="mid">Mid</option>
      <option value="hard">Hard</option>
    </select>
  </div>
  <div>
    <Label htmlFor="taskPriority" className="block mb-1">Task Priority</Label>
    <Input
      id="taskPriority"
      type="number"
      value={newTaskPriority}
      onChange={(e) => setNewTaskPriority(e.target.value)}
      className="w-full"
    />
  </div>
  <div>
    <Label htmlFor="taskExpertise" className="block mb-1">Task Expertise</Label>
    <Input
      id="taskExpertise"
      type="text"
      value={newTaskExpertise}
      onChange={(e) => setNewTaskExpertise(e.target.value)}
      className="w-full"
    />
  </div>
  <div>
    <Label htmlFor="description" className="block mb-1">Description</Label>
    <textarea
      id="description"
      value={newTaskDescription}
      onChange={(e) => setNewTaskDescription(e.target.value)}
      className="border px-4 py-2 rounded w-full"
    ></textarea>
  </div>
  <Button type="submit">Add Task</Button>
</form>

{/*                 <form onSubmit={handleTaskSubmit} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="taskName" className="block mb-1">
                      Task Name
                    </Label>
                    <Input
                      id="taskName"
                      type="text"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      placeholder="Enter task name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taskDeadline" className="block mb-1">
                      Deadline
                    </Label>
                    <Input
                      id="taskDeadline"
                      type="date"
                      value={newTaskDeadline}
                      onChange={(e) => setNewTaskDeadline(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taskEstimatedTime" className="block mb-1">
                      Estimated Time (days)
                    </Label>
                    <Input
                      id="taskEstimatedTime"
                      type="number"
                      value={newTaskEstimatedTime}
                      onChange={(e) => setNewTaskEstimatedTime(e.target.value)}
                      placeholder="Enter estimated time in days"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taskDifficulty" className="block mb-1">
                      Difficulty
                    </Label>
                    <select
                      id="taskDifficulty"
                      value={newTaskDifficulty}
                      onChange={(e) =>
                        setNewTaskDifficulty(e.target.value as "easy" | "mid" | "hard")
                      }
                      className="border px-4 py-2 rounded w-full"
                    >
                      <option value="easy">Easy</option>
                      <option value="mid">Mid</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <Button type="submit">Add Task</Button>
                </form> */}
              </DialogContent>
            </Dialog>
          </div>

          {/* Group Members Display */}
          {selectedGroup && groupMembers.length > 0 && (
            <div className="mt-2 text-sm text-gray-700">
              <strong>Group Members:</strong>{" "}
              {groupMembers.map((member, idx) => (
                <span key={idx}>
                  {member.user.first_name}
                  {idx < groupMembers.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          )}

          {/* Unassigned Tasks Table */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">Unassigned Tasks</h3>
              <Button variant="secondary" onClick={handleAssignTasks}>
                Click to Assign Task
              </Button>
            </div>
            {tasks.filter((task) => !task.assigned).length === 0 ? (
              <p className="text-gray-600">No unassigned tasks.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Difficulty
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.filter((task) => !task.assigned).map((task) => (
                      <tr key={task.id}>
                        <td className="px-4 py-2">{task.task_name}</td>
                        <td className="px-4 py-2">
                          {new Date(task.due_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">{task.difficulty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Assignment Result Display */}
          {assignmentResult.length > 0 && (
            <div className="mt-4 bg-white p-4 rounded shadow">
              <h3 className="text-lg font-bold mb-2">Assignment Result</h3>
              {assignmentResult.map((jobs, userIndex) => (
                <p key={userIndex} className="text-gray-700">
                  <span className="font-semibold">
                    {groupMembers[userIndex].user.first_name}
                  </span>{" "}
                  is assigned:{" "}
                  {jobs
                    .map((jobIndex: number) => {
                      const unassignedTasks = tasks.filter((task) => !task.assigned);
                      return jobIndex < unassignedTasks.length
                        ? unassignedTasks[jobIndex].task_name
                        : "Invalid Job Index";
                    })
                    .join(", ")}
                </p>
              ))}
            </div>
          )}

          {/* Assigned Tasks Table */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">Assigned Tasks</h3>
            {tasks.filter((task) => task.assigned).length === 0 ? (
              <p className="text-gray-600">No assigned tasks.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Difficulty
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.filter((task) => task.assigned).map((task) => (
                      <tr key={task.id}>
                        <td className="px-4 py-2">{task.task_name}</td>
                        <td className="px-4 py-2">
                          {new Date(task.due_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">{task.difficulty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Group selection dialog
        <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="primary">Select a Group</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select a Group</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-2">
              {loading ? (
                <p>Loading groups...</p>
              ) : (
                groups.map((group) => (
                  <Button
                    key={group.group_id}
                    onClick={() => handleGroupSelect(group)}
                    variant="outline"
                    className="w-full"
                  >
                    {group.group_name || "Unnamed Group"}
                  </Button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default GroupTask;