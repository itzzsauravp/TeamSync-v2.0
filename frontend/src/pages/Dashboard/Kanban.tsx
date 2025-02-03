import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { closestCorners, DndContext, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { useEffect, useState } from "react";

const SortableTask = ({ task, columnId, bgColor, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className={`mb-3 cursor-move ${bgColor} border-none shadow-sm`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge
              variant={
                task.priority === "high"
                  ? "destructive"
                  : task.priority === "medium"
                  ? "default"
                  : "secondary"
              }
            >
              {task.priority}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <h4 className="font-semibold mb-1">{task.title}</h4>
          <p className="text-sm text-muted-foreground mb-3">
            {task.description}
          </p>
          <div className="flex items-center justify-between">
            <Avatar className="h-6 w-6">
              <AvatarImage src={`/api/placeholder/24/24`} />
              <AvatarFallback>{task.assignee}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              Due {task.dueDate}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DroppableColumn = ({ column, children }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <Card className={`${column.bgColor} border-none`} ref={setNodeRef}>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {column.title}
          <Badge variant="secondary" className="ml-2">
            {column.tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-200px)]">{children}</ScrollArea>
      </CardContent>
    </Card>
  );
};

const Kanban = () => {
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem("kanban");
    return saved
      ? JSON.parse(saved)
      : {
          todo: {
            id: "todo",
            title: "To Do",
            bgColor: "bg-blue-50",
            cardBg: "bg-blue-100",
            tasks: [
              {
                id: "t1",
                title: "Implement Authentication",
                description: "Add OAuth2 authentication flow",
                priority: "high",
                assignee: "AT",
                dueDate: "2025-02-10",
              },
              {
                id: "t2",
                title: "Design Homepage",
                description: "Create new homepage layout",
                priority: "medium",
                assignee: "JD",
                dueDate: "2025-02-15",
              },
            ],
          },
          ongoing: {
            id: "ongoing",
            title: "On Going",
            bgColor: "bg-yellow-50",
            cardBg: "bg-yellow-100",
            tasks: [
              {
                id: "t3",
                title: "API Integration",
                description: "Connect frontend with backend APIs",
                priority: "high",
                assignee: "MC",
                dueDate: "2025-02-12",
              },
            ],
          },
          verification: {
            id: "verification",
            title: "Pending Verification",
            bgColor: "bg-purple-50",
            cardBg: "bg-purple-100",
            tasks: [
              {
                id: "t4",
                title: "Testing Phase",
                description: "Complete unit testing",
                priority: "medium",
                assignee: "RS",
                dueDate: "2025-02-14",
              },
            ],
          },
          completed: {
            id: "completed",
            title: "Completed",
            bgColor: "bg-green-50",
            cardBg: "bg-green-100",
            tasks: [
              {
                id: "t5",
                title: "Documentation",
                description: "Update API documentation",
                priority: "low",
                assignee: "LK",
                dueDate: "2025-02-08",
              },
            ],
          },
        };
  });

  const [activeTask, setActiveTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    difficulty: "medium",
  });

  useEffect(() => {
    localStorage.setItem("kanban", JSON.stringify(columns));
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = Object.values(columns)
      .flatMap((col) => col.tasks)
      .find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = active.id;
    const overId = over.id;

    // Find the columns containing the tasks or the target column
    const activeColumn = Object.values(columns).find((col) =>
      col.tasks.some((task) => task.id === activeTaskId)
    );

    // Find if we're dropping over a task or directly on a column
    const isOverColumn = Object.values(columns).some(
      (col) => col.id === overId
    );
    const overColumn = isOverColumn
      ? Object.values(columns).find((col) => col.id === overId)
      : Object.values(columns).find((col) =>
          col.tasks.some((task) => task.id === overId)
        );

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id === overColumn.id) {
      // If dropping in the same column, just reorder
      if (!isOverColumn) {
        const activeIndex = activeColumn.tasks.findIndex(
          (t) => t.id === activeTaskId
        );
        const overIndex = overColumn.tasks.findIndex((t) => t.id === overId);
        const newTasks = arrayMove(activeColumn.tasks, activeIndex, overIndex);

        setColumns((prev) => ({
          ...prev,
          [activeColumn.id]: { ...activeColumn, tasks: newTasks },
        }));
      }
    } else {
      // Moving to a different column
      const activeIndex = activeColumn.tasks.findIndex(
        (t) => t.id === activeTaskId
      );
      const movedTask = activeColumn.tasks[activeIndex];

      // Remove from old column
      const newActiveTasks = [...activeColumn.tasks];
      newActiveTasks.splice(activeIndex, 1);

      // Add to new column
      const newOverTasks = [...overColumn.tasks];
      if (isOverColumn) {
        // If dropping directly on a column, add to the end
        newOverTasks.push(movedTask);
      } else {
        // If dropping on a task, insert at that position
        const overIndex = overColumn.tasks.findIndex((t) => t.id === overId);
        newOverTasks.splice(overIndex, 0, movedTask);
      }

      setColumns((prev) => ({
        ...prev,
        [activeColumn.id]: { ...activeColumn, tasks: newActiveTasks },
        [overColumn.id]: { ...overColumn, tasks: newOverTasks },
      }));
    }
    setActiveTask(null);
  };
  const handleDeleteTask = (taskId) => {
    setColumns((prev) => {
      const newColumns = { ...prev };
      Object.keys(newColumns).forEach((colId) => {
        newColumns[colId].tasks = newColumns[colId].tasks.filter(
          (t) => t.id !== taskId
        );
      });
      return newColumns;
    });
  };

  const handleEditTask = (task) => {
    setEditTask(task);
  };

  const handleSaveEdit = () => {
    setColumns((prev) => {
      const newColumns = { ...prev };
      Object.keys(newColumns).forEach((colId) => {
        const taskIndex = newColumns[colId].tasks.findIndex(
          (t) => t.id === editTask.id
        );
        if (taskIndex !== -1) {
          newColumns[colId].tasks[taskIndex] = editTask;
        }
      });
      return newColumns;
    });
    setEditTask(null);
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;

    const newTaskObj = {
      id: `t${Date.now()}`,
      ...newTask,
      assignee: "AT",
      dueDate: new Date().toISOString().split("T")[0],
    };

    setColumns((prev) => ({
      ...prev,
      todo: {
        ...prev.todo,
        tasks: [newTaskObj, ...prev.todo.tasks],
      },
    }));
    setNewTask({ title: "", description: "", difficulty: "medium" });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        {/* ... header remains the same */}
        <div className="flex gap-2">
          <Input
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-40"
          />
          <Input
            placeholder="Task description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="w-60"
          />
          <Select
            value={newTask.difficulty}
            onValueChange={(value) =>
              setNewTask({ ...newTask, difficulty: value })
            }
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddTask} className="gap-2">
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Object.values(columns).map((column) => (
            <DroppableColumn key={column.id} column={column}>
              <SortableContext
                items={column.tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {column.tasks.map((task) =>
                  editTask?.id === task.id ? (
                    <div key={task.id} className="mb-3 p-4 bg-white rounded-lg">
                      <Input
                        value={editTask.title}
                        onChange={(e) =>
                          setEditTask({ ...editTask, title: e.target.value })
                        }
                        className="mb-2"
                      />
                      <Input
                        value={editTask.description}
                        onChange={(e) =>
                          setEditTask({
                            ...editTask,
                            description: e.target.value,
                          })
                        }
                        className="mb-2"
                      />
                      <Select
                        value={editTask.difficulty}
                        onValueChange={(value) =>
                          setEditTask({ ...editTask, difficulty: value })
                        }
                      >
                        <SelectTrigger className="w-full mb-2">
                          <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveEdit}
                          size="sm"
                          className="mr-2"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditTask(null)}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <SortableTask
                      key={task.id}
                      task={task}
                      columnId={column.id}
                      bgColor={column.cardBg}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  )
                )}
              </SortableContext>
            </DroppableColumn>
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <Card className="mb-3 cursor-move bg-blue-100 border-none shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-1">{activeTask.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {activeTask.description}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Kanban;
