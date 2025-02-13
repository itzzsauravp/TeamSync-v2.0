// import React, { useState } from "react";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// // import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox if needed
// // import { Slider } from "@/components/ui/slider"; // Import Slider if needed

// interface Task {
//   task_id: string;
//   task_name: string;
//   due_date: string;
//   status: string;
//   assigned_to: string | null;
//   taskSkillLevel: number;
//   difficulty: string;
//   taskPriority: number;
//   taskExpertise: string;
//   description: string;
//   estimated_time: number;
// }

// interface TaskEditProps {
//   task: Task;
//   onClose: () => void;
//   onSave: (updatedTask: Task) => void;
// }

// const TaskEdit: React.FC<TaskEditProps> = ({ task, onClose, onSave }) => {
//   const [editedTask, setEditedTask] = useState<Task>({ ...task });

//   const handleInputChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) => {
//     const { name, value } = e.target;
//     setEditedTask({ ...editedTask, [name]: value });
//   };

//   const handleSave = () => {
//     onSave(editedTask);
//   };

//   return (
//     <Dialog open={true} onOpenChange={onClose}>

//       <DialogContent>

//         <DialogHeader>
//           <DialogTitle>Edit Task</DialogTitle>
//         </DialogHeader>
//         <form className="space-y-4 mt-4">

//           <div className="grid grid-cols-2 gap-4">

//             {/* Use grid for better layout */}
//             <div>
//               <Label htmlFor="task_name">Task Name</Label>
//               <Input
//                 type="text"
//                 name="task_name"
//                 value={editedTask.task_name}
//                 onChange={handleInputChange}
//                 className="w-full"
//               />
//             </div>
//             <div>

//               <Label htmlFor="taskSkillLevel">Task Skill Level</Label>
//               <Input
//                 type="number"
//                 name="taskSkillLevel"
//                 value={editedTask.taskSkillLevel.toString()} // Convert to string for input
//                 onChange={handleInputChange}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <Label htmlFor="due_date">Due Date</Label>
//               <Input
//                 type="date"
//                 name="due_date"
//                 value={editedTask.due_date}
//                 onChange={handleInputChange}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <Label htmlFor="taskPriority">Task Priority</Label>
//               <Input
//                 type="number"
//                 name="taskPriority"
//                 value={editedTask.taskPriority.toString()}
//                 onChange={handleInputChange}
//                 className="w-full"
//               />
//             </div>
//             <div>

//               <Label htmlFor="taskExpertise">Task Expertise</Label>
//               <Input
//                 type="text"
//                 name="taskExpertise"
//                 value={editedTask.taskExpertise}
//                 onChange={handleInputChange}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <Label htmlFor="difficulty">Difficulty</Label>
//               <select
//                 name="difficulty"
//                 value={editedTask.difficulty}
//                 onChange={handleInputChange}
//                 className="w-full border px-4 py-2 rounded"
//               >
//                 <option value="easy">Easy</option>
//                 <option value="mid">Medium</option>
//                 <option value="hard">Hard</option>
//               </select>
//             </div>
//             <div>
//               <Label htmlFor="status">Status</Label>
//               <Input
//                 type="text"
//                 name="status"
//                 value={editedTask.status}
//                 onChange={handleInputChange}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <Label htmlFor="assigned_to">Assigned To</Label>
//               <Input
//                 type="text"
//                 name="assigned_to"
//                 value={editedTask.assigned_to || ""}
//                 onChange={handleInputChange}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <Label htmlFor="description">Description</Label>
//               <textarea
//                 name="description"
//                 value={editedTask.description}
//                 onChange={handleInputChange}
//                 className="border px-4 py-2 rounded w-full h-20" // Adjust height as needed
//               />
//             </div>
//             <div>

//               <Label htmlFor="estimated_time">Estimated Time</Label>
//               <Input
//                 type="number"
//                 name="estimated_time"
//                 value={editedTask.estimated_time.toString()}
//                 onChange={handleInputChange}
//                 className="w-full"
//               />
//             </div>
//           </div>
//           {/* Close grid */}
//           <Button onClick={handleSave} className="mt-4">
//             Save
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default TaskEdit;

import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox if needed
// import { Slider } from "@/components/ui/slider"; // Import Slider if needed

interface Task {
  task_id: string;
  task_name: string;
  due_date: string;
  status: string;
  assigned_to: string | null;
  taskSkillLevel: number;
  difficulty: string;
  taskPriority: number;
  taskExpertise: string;
  description: string;
  estimated_time: number;
}

interface TaskEditProps {
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

const TaskEdit: React.FC<TaskEditProps> = ({ task, onClose, onSave }) => {
  const [editedTask, setEditedTask] = useState<Task>({ ...task });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditedTask({ ...editedTask, [name]: value });
  };

  const handleSave = () => {
    onSave(editedTask);
  };

  const handleClearAssignedTo = () => {
    setEditedTask({ ...editedTask, assigned_to: null });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Use grid for better layout */}

            <div>
              <Label htmlFor="task_name">Task Name</Label>

              <Input
                type="text"
                name="task_name"
                value={editedTask.task_name}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="taskSkillLevel">Task Skill Level</Label>

              <Input
                type="number"
                name="taskSkillLevel"
                value={editedTask.taskSkillLevel.toString()} // Convert to string for input
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="due_date">Due Date</Label>

              <Input
                type="date"
                name="due_date"
                value={editedTask.due_date}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="taskPriority">Task Priority</Label>

              <Input
                type="number"
                name="taskPriority"
                value={editedTask.taskPriority.toString()}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="taskExpertise">Task Expertise</Label>

              <Input
                type="text"
                name="taskExpertise"
                value={editedTask.taskExpertise}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty</Label>

              <select
                name="difficulty"
                value={editedTask.difficulty}
                onChange={handleInputChange}
                className="w-full border px-4 py-2 rounded"
              >
                <option value="easy">Easy</option>
                <option value="mid">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>

              <select
                name="status"
                value={editedTask.status}
                onChange={handleInputChange}
                className="w-full border px-4 py-2 rounded"
              >
                <option value="ongoing">Ongoing</option>
                <option value="pending">Pending</option>
                <option value="aborted">Aborted</option>
                <option value="complete">Complete</option>
              </select>
            </div>

            <div>
              <Label htmlFor="assigned_to">Assigned To</Label>

              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  name="assigned_to"
                  value={editedTask.assigned_to || ""}
                  onChange={handleInputChange}
                  className="w-full"
                />

                <Button
                  type="button" // Prevent form submission
                  onClick={handleClearAssignedTo}
                  variant="secondary"
                  size="sm"
                >
                  Clear
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>

              <textarea
                name="description"
                value={editedTask.description}
                onChange={handleInputChange}
                className="border px-4 py-2 rounded w-full h-20" // Adjust height as needed
              />
            </div>

            <div>
              <Label htmlFor="estimated_time">Estimated Time</Label>

              <Input
                type="number"
                name="estimated_time"
                value={editedTask.estimated_time.toString()}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>
          {/* Close grid */}
          <Button onClick={handleSave} className="mt-4">
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEdit;
