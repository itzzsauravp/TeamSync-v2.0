import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { updateTaskApi } from "@/api/taskApi";

const TaskCard = ({ task }) => {
  const dueDate = new Date(task.due_date);
  const currentTime = new Date();
  const isOverdue = currentTime.getTime() >= dueDate.getTime();

  const [selectedStatus, setSelectedStatus] = useState(task.status);
  const [openDialog, setOpenDialog] = useState(false);
  const [updatedTaskData, setUpdatedTaskData] = useState(null);

  const handleStatusSave = async () => {
    console.log("Selected status:", selectedStatus);
    try {
      const result = await updateTaskApi(
        { status: selectedStatus },
        task.task_id
      );
      console.log(result);
      setUpdatedTaskData(result.data.status);
      setOpenDialog(true);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <>
      <Card className="mb-6 rounded-lg border border-gray-200 shadow hover:shadow-md transition-all duration-300">
        <CardHeader className="p-4 bg-black text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            {/* Task Title & Due Date */}
            <div>
              <CardTitle className="text-xl font-semibold">
                {task.task_name}
              </CardTitle>
              <div className="flex items-center text-sm mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                <span className={cn(isOverdue && "text-red-300")}>
                  Due on {dueDate.toLocaleDateString()}
                </span>
                {isOverdue && (
                  <span className="ml-2 font-bold text-red-300">(Overdue)</span>
                )}
              </div>
            </div>
            {/* Assigned Info */}
            <div className="text-right text-sm">
              <div className="flex items-center justify-end">
                <span className="font-bold mr-2">Task Executor:</span>
                <span>{task.taskTo || "Unassigned"}</span>
              </div>
              <div className="flex items-center justify-end mt-1">
                <span className="font-bold mr-2">Task Author:</span>
                <span>{task.taskBy || "Unknown"}</span>
              </div>
              <div className="flex items-center justify-end mt-1">
                <span className="font-bold mr-2">From Group:</span>
                <span>{task.groupName || "Unknown"}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details">
              <AccordionTrigger className="flex items-center justify-between text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
                <span>View Details</span>
              </AccordionTrigger>
              <AccordionContent className="mt-2 text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Description:</strong>{" "}
                  {task.description || "No description provided."}
                </p>
                <p>
                  <strong>Expertise:</strong> {task.taskExpertise || "N/A"}
                </p>
                {/* Status Dropdown with Save Button */}
                <div className="flex items-center space-x-2">
                  <strong>Status:</strong>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStatusSave}
                  >
                    Save
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>

        <CardFooter className="p-3 border-t border-gray-200 text-xs text-gray-500">
          Task ID: {task.task_id}
        </CardFooter>
      </Card>

      {/* Success Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Task Updated</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            The task has been updated successfully. Here are the updated
            details:
            <pre className="mt-2 bg-gray-100 p-2 rounded text-xs">
              {JSON.stringify(updatedTaskData, null, 2)}
            </pre>
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskCard;
