// src/components/GroupTask.tsx

import React, { useEffect, useState } from "react";
import { fetchAllGroups } from "../api/groupApi";
import { fetchAdminGroups } from "../api/groupMemberApi";
import main from "../../../algo.js";
import {listGroupTasksApi, createTaskApi} from "../api/taskApi.js";


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

// Define a Group type based on the API response
interface Group {
  group_id: string;
  group_name: string;
}

// Define a Task type
interface Task {
  id: string;
  name: string;
  deadline: string; // Expected in YYYY-MM-DD format
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

  const handleAssignTasks = () => {
    const unassignedTasks = tasks.filter((task) => !task.assigned);
    if (groupMembers.length === 0 || unassignedTasks.length === 0) {
      alert("Not enough group members or tasks to assign.");
      return;
    }

    // Create a cost matrix with dimensions: groupMembers.length x unassignedTasks.length
    // For example, use a simple cost function: cost = (rowIndex + 1) * (colIndex + 1)
    const costMatrix = groupMembers.map((_, i) =>
      unassignedTasks.map((_, j) => (i + 1) * (j + 1))
    );

    // Run the main function from algo.js with the cost matrix
    const assignment = main(costMatrix);
    setAssignmentResult(assignment);
  };
  // 2. Replace your current group members useEffect with this one:
  useEffect(() => {
    if (selectedGroup) {
      const loadGroupMembers = async () => {
        try {
          const membersData = await fetchAdminGroups(selectedGroup.group_id);
          setGroupMembers(membersData);
        } catch (error) {
          console.error("Error fetching group members:", error);
        }
      };
      loadGroupMembers();
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedGroup) {
      const loadGroupTasks = async () => {
        try {
          const result = await listGroupTasksApi(selectedGroup.group_id);
          if (result.success) {
            // Assuming result.data is the array of tasks associated with the group
            console.log(result);
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
  

  // Task state and form fields
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<
    "easy" | "mid" | "hard"
  >("easy");
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState<boolean>(false);

  // Fetch groups when the component mounts
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const data = await fetchAllGroups();
        // Expecting data to be an object with a "groups" array
        if (data && Array.isArray(data.groups)) {
          setGroups(data.groups);
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

  useEffect(() => {
    if (selectedGroup) {
      const loadGroupMembers = async () => {
        try {
        //   console.log("printint members");
        //   console.log(selectedGroup);
          const groups = await fetchAdminGroups(selectedGroup.group_id);
          const members = groups.groups.filter(
            (x) => x.group_id == selectedGroup.group_id
          )[0].groupMembers;
          //   const membersName = members.map((x) => x.user.first_name);
          // console.log(membersName);
          setGroupMembers(members);
        } catch (error) {
          console.error("Error fetching group members:", error);
        }
      };
      loadGroupMembers();
    }
  }, [selectedGroup]);

  // Handle new task submission
    const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName || !newTaskDeadline || !newTaskDifficulty) return;

    // Prepare task payload – ensure you replace "your-column-id" with the actual column ID if available
    const taskPayload = {
      task_name: newTaskName,
      column_id: "your-column-id",
      group_id: selectedGroup?.group_id,
      due_date: newTaskDeadline,
      // Map "mid" to "medium" if needed by the database model
      difficulty: newTaskDifficulty === "mid" ? "medium" : newTaskDifficulty,
    };

    const result = await createTaskApi(taskPayload);
    if (result.success) {
      // Append the task returned from the database to the tasks state
      setTasks((prev) => [...prev, result.data]);
    } else {
      alert("Error adding task");
    }

    // Clear form fields and close the dialog
    setNewTaskName("");
    setNewTaskDeadline("");
    setNewTaskDifficulty("easy");
    setIsTaskDialogOpen(false);
  };

  return (
    <div className="p-4">
      {selectedGroup ? (
        <div>
          {/* Selected Group Header and Change Group Dialog */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Selected Group</h2>
              <p>{selectedGroup.group_name}</p>
            </div>
            <Dialog
              open={isGroupDialogOpen}
              onOpenChange={setIsGroupDialogOpen}
            >
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

          {/* Add Task Button and Task Dialog */}
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
                    <Label htmlFor="taskDifficulty" className="block mb-1">
                      Difficulty
                    </Label>
                    <select
                      id="taskDifficulty"
                      value={newTaskDifficulty}
                      onChange={(e) =>
                        setNewTaskDifficulty(
                          e.target.value as "easy" | "mid" | "hard"
                        )
                      }
                      className="border px-4 py-2 rounded w-full"
                    >
                      <option value="easy">Easy</option>
                      <option value="mid">Mid</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <Button type="submit">Add Task</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {selectedGroup && groupMembers.length > 0 && (
            <div className="mt-2">
              <strong>Group Members: </strong>
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
            <h3 className="text-lg font-bold mb-2">Unassigned Tasks</h3>
            {tasks.filter((task) => !task.assigned).length === 0 ? (
              <p>No unassigned tasks.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Task Name</th>
                    <th className="border px-4 py-2">Deadline</th>
                    <th className="border px-4 py-2">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks
                    .filter((task) => !task.assigned)
                    .map((task) => (
                      <tr key={task.id}>
                        <td className="border px-4 py-2">{task.name}</td>
                        <td className="border px-4 py-2">{task.deadline}</td>
                        <td className="border px-4 py-2">{task.difficulty}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>

          {assignmentResult.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Assignment Result</h3>
              {assignmentResult.map((jobs, userIndex) => (
                <p key={userIndex}>
                  {groupMembers[userIndex].user.first_name} is assigned jobs:{" "}
                  {jobs
                    .map(
                      (jobIndex: number) =>
                        tasks.filter((task) => !task.assigned)[jobIndex].name
                    )
                    .join(", ")}
                </p>
              ))}
            </div>
          )}
          {/* Assigned Tasks Table */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">Assigned Tasks</h3>
            {tasks.filter((task) => task.assigned).length === 0 ? (
              <p>No assigned tasks.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Task Name</th>
                    <th className="border px-4 py-2">Deadline</th>
                    <th className="border px-4 py-2">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks
                    .filter((task) => task.assigned)
                    .map((task) => (
                      <tr key={task.id}>
                        <td className="border px-4 py-2">{task.name}</td>
                        <td className="border px-4 py-2">{task.deadline}</td>
                        <td className="border px-4 py-2">{task.difficulty}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        // If no group is selected, show the group selection dialog
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
