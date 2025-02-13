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
import { cn } from "@/lib/utils";

const TaskCard = ({ task }) => {
  return (
    <Card className="mb-6 p-4 shadow-lg border border-gray-300 rounded-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-col gap-2 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white p-4 rounded-md">
        <CardTitle className="text-2xl font-bold">{task.task_name}</CardTitle>
        <span
          className={cn(
            new Date().getTime() >= new Date(task.due_date).getTime() &&
              "text-red-500"
          )}
        >
          Due on {new Date(task.due_date).toLocaleDateString()}{" "}
          {new Date().getTime() >= new Date(task.due_date).getTime() && (
            <span className="font-bold">(Deadline crossed)</span>
          )}
        </span>
      </CardHeader>
      <CardContent className="bg-white p-4 rounded-b-lg">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details">
            <AccordionTrigger className="px-2 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200">
              View Details
            </AccordionTrigger>
            <AccordionContent className="mt-2 text-sm text-gray-800">
              <p className="mb-1">
                <strong>Description:</strong> {task.description}
              </p>
              <p className="mb-1">
                <strong>Expertise:</strong> {task.taskExpertise}
              </p>
              <p className="mb-1">
                <strong>Status:</strong> {task.status}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 border-t mt-4 pt-2">
        Task ID: {task.task_id}
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
