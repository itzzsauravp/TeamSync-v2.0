import React, { useEffect, useState } from "react";
import { fetchAdminGroups } from "../api/groupMemberApi";
import { listGroupTasksApi, createTaskApi, assignTaskApi, deleteTaskApi } from "../api/taskApi.js";
import { updateWeights } from "../api/groupApi";
import solver from "../../algoSolver.js";
import Test from "../pages/Test";
import TaskEdit from "./TaskEdit.js";
import { expertiseOptions } from "@/assets/data.js";

// Import shadcn UI components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CloudCog } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Settings } from "lucide-react";

// Define a Group type based on the API response
interface Group {
  group_id: string;
  group_name: string;
}

// Define a Task type (keys match the backend response - updated to include status and assigned_to)
interface Task {
  task_id: string; // changed from id to task_id to match backend and model
  task_name: string;
  due_date: string; // Expected in YYYY-MM-DD format
  status: string; // Add status to Task type
  assigned_to: string | null; // Add assigned_to to Task type, can be null if not assigned
  taskSkillLevel: number;
  difficulty: string;
  taskPriority: number;
  taskExpertise: string;
  description: string;
  estimated_time: number;
}

const weightLabels = [
  "Skill",
  "Experties",
  "Task Priority",
  "User Availability",
];

const GroupTask: React.FC = () => {
  // Group selection state
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [weights, setWeights] = useState<number[]>([1,1,1,1]);
  const [error, setError] = useState<string | null>(null);

  // Task state and form fields
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState<boolean>(false);

  // For adding task
  const [newTaskSkillLevel, setNewTaskSkillLevel] = useState(1);
  const [newTaskPriority, setNewTaskPriority] = useState(1);
  const [newTaskExpertise, setNewTaskExpertise] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDifficulty, setNewTaskDifficulty] = useState("easy");

  // Selection states
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]); // Store user IDs
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]); // Store task IDs
  const [selectAllUsers, setSelectAllUsers] = useState<boolean>(false);
  const [selectAllTasks, setSelectAllTasks] = useState<boolean>(false);
  
  const [selectedExpertise, setSelectedExpertise] = useState("");


  // NEW: Recommended assignment state (returned from the solver)
  const [recommendedAssignments, setRecommendedAssignments] = useState<any[]>(
    []
  );
  const [isWeightsVisible, setIsWeightsVisible] = useState<boolean>(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null); // State for editing task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };
  // Function to handle task delete
  const handleDeleteTask = async(taskId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (confirmDelete) {
      // Add your custom delete logic here, e.g., calling an API
      console.log(`Deleting task with ID: ${taskId}`);
      await deleteTaskApi(taskId);
      // After successful deletion, update the tasks state:
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.task_id !== taskId)
      );
    }
  };
  function getUserNameFromID(id){
  //  console.log(groupMembers);
   let result = groupMembers.find((member)=> member.user_id == id).user.username;
   return result;
  }
  function handleExpertiseSelect(){
    return;
  }

  // Load groups when the component mounts
  useEffect(() => {
    const loadGroups = async () => {
      try {
        let data = await fetchAdminGroups();
        // Filter groups with more than 2 members
        data = data.groups.filter(
          (item: any) => item.groupMembers.length !== 2
        );
        console.log(data);

        if (data && Array.isArray(data)) {
          setGroups(data);
        } else {
          console.error("Unexpected data format from fetchAdminGroups", data);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    };
    loadGroups();
  }, []);

  const handleExpertisePriority = () => {
    setWeights([1, 2, 1, 1]); // Example: High Experties
    // alert("Weights set to Expertise Priority");
  };

  const handleSkillPriority = () => {
    setWeights([2, 1, 1, 1]); // Example: High Skill
    // alert("Weights set to Skill Priority");
  };

  const handleTaskPriorityPreset = () => {
    setWeights([1, 1, 2, 1]); // Example: High Task Priority
    // alert("Weights set to Task Priority");
  };

  const handleUserAvailabilityPreset = () => {
    setWeights([1, 1, 1, 2]); // Example: High User Availability
    // alert("Weights set to User Availability Priority");
  };

  const toggleWeightsVisibility = () => {
    setIsWeightsVisible(!isWeightsVisible);
  };

  // Handle group selection
  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    setIsGroupDialogOpen(false);
    setSelectedUsers([]); // Reset user selection when group changes
    setSelectedTasks([]); // Reset task selection when group changes
    setSelectAllUsers(false);
    setSelectAllTasks(false);
    // Clear any previous recommended assignments
    setRecommendedAssignments([]);
  };

  const handleWeightChange = (index: number, newValue: number) => {
    const newWeights = [...weights];
    newWeights[index] = newValue;
    setWeights(newWeights);
  };
  const handleSaveWeights = async () => {
    // const total = weights.reduce((acc, cur) => acc + cur, 0);
    // if (total > 2) {
    //   setError("The weights cannot be more than 2.");
    //   return;
    // }
    setError(null);
    const weightString = weights.join(",");
    try {
      await updateWeights(selectedGroup.group_id, weightString);
      alert("Weights updated successfully!");
    } catch (err) {
      console.error("Error updating weights", err);
      alert("Error updating weights");
    }
  };

  // Load group members using the API response structure
  useEffect(() => {
    if (selectedGroup) {
      const loadGroupMembers = async () => {
        try {
          const groupsData = await fetchAdminGroups();
          // console.log(groupsData);
          console.log("das ist selected Group");
          console.log(selectedGroup);
          const groupObj = groupsData.groups.find(
            (x: any) => x.group_id === selectedGroup.group_id
          );
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

  // load weight
  useEffect(() => {
    if (!selectedGroup) return;
    if (!selectedGroup.weight  || selectedGroup.weight == null) {
      setWeights([1, 1, 1, 1]);
      return;
    }
    let tempWeights = selectedGroup.weight.split(",").map(Number);
    setWeights(tempWeights);
  }, [selectedGroup]);

  // Handle new task submission
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that all required fields are filled and that a group is selected
    if (
      !newTaskName ||
      !newTaskSkillLevel ||
      !newTaskDeadline ||
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
      estimated_time: 1, // remind me to remove this,
      due_date: newTaskDeadline,
      taskPriority: Number(newTaskPriority),
      taskExpertise: newTaskExpertise,
      description: newTaskDescription,
      difficulty: newTaskDifficulty,
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

  // Handle task assignment using the solver.
  // The solver returns an array of objects { task: {}, user: {} }
  const handleAssignTasks = async () => {
    try {
      const result = await solver(selectedUsers, selectedTasks, selectedGroup);
      console.log("Solver result:", result);
      setRecommendedAssignments(result);
    } catch (error) {
      console.error("Error in assignment:", error);
    }
  };

  // Approve a recommended assignment. This updates the task to mark it as assigned,
  // then removes the recommendation from the list.
  
  // const handleApproveAssignment = (index: number) => {
  //   const assignment = recommendedAssignments[index];
  //   // Update tasks state: mark the task as assigned to the user returned from the solver
  //   setTasks((prevTasks) =>
  //     prevTasks.map((task) => {
  //       if (task.task_id === assignment.task.task_id) {
  //         console.log("call the function to assign here");
  //         console.log(assignment);
  //         const result = await assignTaskApi(assignment.task.task_id, assignment.user.user_id);
          
  //         return {
  //           ...task,
  //           assigned_to: assignment.user.user_id,
  //           status: "assigned",
  //         };
  //       }
  //       return task;
  //     })
  //   );
  //   // Remove the approved assignment from the recommended list
  //   setRecommendedAssignments((prev) => prev.filter((_, i) => i !== index));
  // };
  const handleApproveAssignment = async (index: number) => {
        const assignment = recommendedAssignments[index];
        if (!assignment) {
          console.error("Assignment not found at index:", index);
          return; // Exit if assignment is not found
        }
    
        try {
          console.log("call the function to assign here");
          console.log(assignment);
          const result = await assignTaskApi( assignment.user.user_id,assignment.task.task_id);
          console.log("assignTaskApi result:", result); // Log the result of the API call
    
          // Update tasks state: mark the task as assigned to the user returned from the solver
          setTasks((prevTasks) =>
            prevTasks.map((task) => {
              if (task.task_id === assignment.task.task_id) {
                return {
                  ...task,
                  assigned_to: assignment.user.user_id,
                  status: "assigned",
                };
              }
              return task;
             })
          );
    
          // Remove the approved assignment from the recommended list
          setRecommendedAssignments((prev) => prev.filter((_, i) => i !== index));
    
        } catch (error) {
          console.error("Error assigning task:", error);
          // Handle error appropriately, e.g., show an error message to the user
        }
      }; 

  // Dismiss a recommended assignment (remove it from the recommended list)
  const handleDismissAssignment = (index: number) => {
    setRecommendedAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  // User selection handlers
  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prevSelectedUsers) => {
      if (prevSelectedUsers.includes(userId)) {
        return prevSelectedUsers.filter((id) => id !== userId);
      } else {
        return [...prevSelectedUsers, userId];
      }
    });
  };

  const handleSelectAllUsers = () => {
    setSelectAllUsers(!selectAllUsers);
    if (!selectAllUsers) {
      setSelectedUsers(groupMembers.map((member) => member.user.user_id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Task selection handlers
  const handleTaskSelect = (taskId: string) => {
    setSelectedTasks((prevSelectedTasks) => {
      if (prevSelectedTasks.includes(taskId)) {
        return prevSelectedTasks.filter((id) => id !== taskId);
      } else {
        return [...prevSelectedTasks, taskId];
      }
    });
  };

  const handleSelectAllTasks = () => {
    setSelectAllTasks(!selectAllTasks);
    if (!selectAllTasks) {
      setSelectedTasks(
        tasks.filter((task) => !task.assigned_to).map((task) => task.task_id)
      );
    } else {
      setSelectedTasks([]);
    }
  };

  return (
    <div className="p-6 min-h-screen">
      {!selectedGroup && <Test setSelectedGroup={setSelectedGroup} />}
      {selectedGroup && (
        <div>
          <Button onClick={() => setSelectedGroup(null)}>Change Group</Button>
          <br />
          <br />
          {/* Selected Group Header */}
          <div className="mb-6 flex items-center justify-between bg-white p-4 rounded shadow">
            <div className="flex items-center">
              <CloudCog className="w-6 h-6 mr-2 text-blue-500" />
              <div>
                <h2 className="text-xl font-bold">
                  {selectedGroup.group_name}
                </h2>
                <p className="text-gray-600">
                  Created:{" "}
                  {new Date(selectedGroup.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Add Task Dialog */}
          <div className="mb-4">
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Add Task</Button>
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
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taskSkillLevel" className="block mb-1">
                      Task Skill Level
                    </Label>
                    <Input
                      id="taskSkillLevel"
                      type="number"
                      value={newTaskSkillLevel}
                      onChange={(e) =>
                        setNewTaskSkillLevel(Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate" className="block mb-1">
                      Due Date
                    </Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTaskDeadline}
                      onChange={(e) => setNewTaskDeadline(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taskPriority" className="block mb-1">
                      Task Priority
                    </Label>
                    <Input
                      id="taskPriority"
                      type="number"
                      value={newTaskPriority}
                      onChange={(e) =>
                        setNewTaskPriority(Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taskExpertise" className="block mb-1">
                      Task Expertise
                    </Label>
                    <Input
                      id="taskExpertise"
                      type="text"
                      value={newTaskExpertise}
                      onChange={(e) => setNewTaskExpertise(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="w-full">
                        <Select onValueChange={handleExpertiseSelect}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select expertise to add" />
                          </SelectTrigger>
                          <SelectContent>
                            {expertiseOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedExpertise.split(",").map((expertise, index) =>
                          <Button
                            key={index}
                            type="button"
                            variant="outline"
                            className="text-sm flex items-center gap-1"
                            onClick={() => {
                              /* const newExpertise =
                                selectedExpertise.filter(
                                  (item) => item !== expertise
                                );
                              setUpdatedUserInfo({
                                ...updatedUserInfo,
                                userExpertise: newExpertise,
                              }); */
                            }}
                          >
                            {expertise} <span>×</span>
                          </Button>
                      )}
                    </div>
                  {/* <div>
                    <Label htmlFor="difficulty" className="block mb-1">
                      Difficulty
                    </Label>
                    <select
                      id="difficulty"
                      className="w-full border px-4 py-2 rounded"
                      value={newTaskDifficulty}
                      onChange={(e) => setNewTaskDifficulty(e.target.value)}
                    >
                      <option value="easy">Easy</option>
                      <option value="mid">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div> */}
                  <div>
                    <Label htmlFor="description" className="block mb-1">
                      Description
                    </Label>
                    <textarea
                      id="description"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="border px-4 py-2 rounded w-full"
                    ></textarea>
                  </div>
                  <Button type="submit">Add Task</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Group Members Display as Table */}
          {selectedGroup && groupMembers.length > 0 && (
            <div className="mt-8 bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Group Members</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllUsers}
                >
                  {selectAllUsers ? "Deselect All Users" : "Select All Users"}
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Checkbox
                          checked={selectAllUsers}
                          onCheckedChange={handleSelectAllUsers}
                        />
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Skill Level
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Busy Until
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groupMembers.map((member) => (
                      <tr key={member.user.user_id}>
                        <td className="px-2 py-2">
                          <Checkbox
                            checked={selectedUsers.includes(
                              member.user.user_id
                            )}
                            onCheckedChange={() =>
                              handleUserSelect(member.user.user_id)
                            }
                          />
                        </td>
                        <td className="px-4 py-2">{member.user.first_name}</td>
                        <td className="px-4 py-2">
                          {member.user.skillLevel}
                        </td>{" "}
                        {/* Placeholder */}
                        <td className="px-4 py-2">
                          {member.user.userBusyUntill
                            ? new Date(
                                member.user.userBusyUntill
                              ).toLocaleDateString()
                            : "none"}
                        </td>{" "}
                        {/* Placeholder */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Unassigned Tasks Table */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">Unassigned Tasks</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllTasks}
              >
                {selectAllTasks ? "Deselect All Tasks" : "Select All Tasks"}
              </Button>
            </div>
            {tasks.filter((task) => !task.assigned_to).length === 0 ? (
              <p className="text-gray-600">No unassigned tasks.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Checkbox
                          checked={selectAllTasks}
                          onCheckedChange={handleSelectAllTasks}
                        />
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task Skill Level
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks
                      .filter((task) => !task.assigned_to) // Filter for unassigned tasks
                      .map((task) => (
                        <tr key={task.task_id}>
                          <td className="px-2 py-2">
                            <Checkbox
                              checked={selectedTasks.includes(task.task_id)}
                              onCheckedChange={() =>
                                handleTaskSelect(task.task_id)
                              }
                            />
                          </td>
                          <td className="px-4 py-2">{task.task_name}</td>
                          <td className="px-4 py-2">
                            {new Date(task.due_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">{task.taskSkillLevel}</td>
                          <td className="px-4 py-2">{task.status}</td>
                          <td className="px-4 py-2 text-gray-500">
                            Unassigned
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Button onClick={handleAssignTasks}>
                  Click to Assign Task
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleWeightsVisibility}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {/* Weights Section with a fixed width */}
          {isWeightsVisible && (
            <div className="mt-6 p-4 border rounded w-64 mx-auto">
              <div>
                <div className="flex justify-around mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExpertisePriority}
                  >
                    Experties
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSkillPriority}
                  >
                    Skill
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTaskPriorityPreset}
                  >
                    Task Priority
                  </Button>
                </div>
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
                        max={2}
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
          )}

          {/* Recommended Assignments Table */}
          {recommendedAssignments.length > 0 && (
            <div className="mt-4 bg-white p-4 rounded shadow">
              <h3 className="text-lg font-bold mb-2">
                Recommended Assignments
              </h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skill Level
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Busy Until
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recommendedAssignments.map((assignment, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">{assignment.task.task_name}</td>
                      <td className="px-4 py-2">
                        {new Date(
                          assignment.task.due_date
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        {assignment.task.taskSkillLevel}
                      </td>
                      <td className="px-4 py-2">
                        {assignment.user.first_name}
                      </td>
                      <td className="px-4 py-2">
                        {assignment.user.userBusyUntill
                          ? new Date(
                              assignment.user.userBusyUntill
                            ).toLocaleDateString()
                          : "none"}
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleApproveAssignment(index)}
                          className="bg-green-500"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDismissAssignment(index)}
                          className="ml-2"
                        >
                          Dismiss
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Assigned Tasks Table */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">Assigned Tasks</h3>
            {tasks.filter((task) => task.assigned_to).length === 0 ? (
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
                        User Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skill Level
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks
                      .filter((task) => task.assigned_to) // Filter for assigned tasks (assigned_to is not null)
                      .map((task) => (
                        <tr key={task.task_id}>
                          <td className="px-4 py-2">{task.task_name}</td>
                          <td className="px-4 py-2">{getUserNameFromID(task.assigned_to)}</td>
                          <td className="px-4 py-2">
                            {new Date(task.due_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">{task.taskSkillLevel}</td>
                          <td className="px-4 py-2">{task.status}</td>
                          <td className="px-4 py-2 text-gray-900">
                            <td className="px-4 py-2 flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTask(task)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteTask(task.task_id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Task Edit Component (Rendered when editingTask is not null) */}
          {editingTask && (
            <TaskEdit
              task={editingTask}
              onClose={() => setEditingTask(null)} // Close the edit component
              onSave={(updatedTask) => {
                // Update the tasks state with the edited task
                setTasks((prevTasks) =>
                  prevTasks.map((task) =>
                    task.task_id === updatedTask.task_id ? updatedTask : task
                  )
                );
                setEditingTask(null); // Close the edit component after saving
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default GroupTask;
