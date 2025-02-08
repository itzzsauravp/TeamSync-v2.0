import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/userSlice";

// API functions from kanbanApi.ts
import {
  createKanban,
  getAllKanbans,
  updateKanban,
  deleteKanban,
} from "@/api/kanbanApi";

// ---------- Helper: SortableTask Component ----------
// Now uses the authenticated user's profile picture for the avatar.
const SortableTask = ({ task, bgColor, onEdit, onDelete, userProfilePicture }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.kanban_id });
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
                  onClick={() => onDelete(task.kanban_id)}
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
            {/* Use the authenticated user's profile picture for the avatar */}
            <Avatar className="h-6 w-6">
              {userProfilePicture ? (
                <AvatarImage src={userProfilePicture} />
              ) : (
                <AvatarFallback>{task.title[0]}</AvatarFallback>
              )}
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

// ---------- Helper: DroppableColumn Component ----------
const DroppableColumn = ({ column, children }) => {
  const { setNodeRef } = useDroppable({ id: column.id });
  return (
    <Card
      ref={setNodeRef}
      className={`${column.bgColor} border-none`}
      style={{ minHeight: "300px" }}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {column.title}
          <Badge variant="secondary" className="ml-2">
            {column.tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-300px)]">{children}</ScrollArea>
      </CardContent>
    </Card>
  );
};

// ---------- Main KanbanBoard Component ----------
const KanbanBoard = () => {
  // Define columns by task status.
  const initialColumns = {
    todo: {
      id: "todo",
      title: "To Do",
      bgColor: "bg-blue-50",
      cardBg: "bg-blue-100",
      tasks: [],
    },
    ongoing: {
      id: "ongoing",
      title: "On Going",
      bgColor: "bg-yellow-50",
      cardBg: "bg-yellow-100",
      tasks: [],
    },
    pending_verification: {
      id: "pending_verification",
      title: "Pending Verification",
      bgColor: "bg-purple-50",
      cardBg: "bg-purple-100",
      tasks: [],
    },
    completed: {
      id: "completed",
      title: "Completed",
      bgColor: "bg-green-50",
      cardBg: "bg-green-100",
      tasks: [],
    },
  };

  const [columns, setColumns] = useState(initialColumns);
  const [activeTask, setActiveTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const allTasks = Object.values(columns).flatMap(column => column.tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Get the authenticated user from the Redux store to use their profile picture.
  const user = useSelector(selectUser);

  // Centralized function: re-fetch tasks from the database.
  const fetchTasks = async () => {
    setIsLoading(true);
    const data = await getAllKanbans();
    if (data?.success) {
      // Create fresh column objects with new task arrays.
      const newCols = {
        todo: { ...initialColumns.todo, tasks: [] },
        ongoing: { ...initialColumns.ongoing, tasks: [] },
        pending_verification: { ...initialColumns.pending_verification, tasks: [] },
        completed: { ...initialColumns.completed, tasks: [] },
      };
      data.tasks.forEach((task) => {
        const status = task.status || "todo";
        if (newCols[status]) {
          newCols[status].tasks.push(task);
        }
      });
      setColumns(newCols);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ---------- Drag & Drop Handlers ----------
  const handleDragStart = (event) => {
    const { active } = event;
    const task = Object.values(columns)
      .flatMap((col) => col.tasks)
      .find((t) => t.kanban_id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) {
      setActiveTask(null);
      return;
    }
    const activeTaskId = active.id;
    const overId = over.id;

    let sourceCol, destCol;
    for (const col of Object.values(columns)) {
      if (col.tasks.find((t) => t.kanban_id === activeTaskId)) sourceCol = col;
      if (col.id === overId || col.tasks.find((t) => t.kanban_id === overId))
        destCol = col;
    }
    if (!sourceCol || !destCol) {
      setActiveTask(null);
      return;
    }

    if (sourceCol.id === destCol.id) {
      const activeIndex = sourceCol.tasks.findIndex((t) => t.kanban_id === activeTaskId);
      const overIndex = destCol.tasks.findIndex((t) => t.kanban_id === overId);
      const newTasks = arrayMove(sourceCol.tasks, activeIndex, overIndex);
      setColumns((prev) => ({
        ...prev,
        [sourceCol.id]: { ...sourceCol, tasks: newTasks },
      }));
      await fetchTasks();
    } else {
      const task = sourceCol.tasks.find((t) => t.kanban_id === activeTaskId);
      if (!task) {
        setActiveTask(null);
        return;
      }
      const newStatus = destCol.id;
      const updated = await updateKanban(task.kanban_id, { status: newStatus });
      if (!updated?.success) {
        console.error("Failed to update task status on the server");
      }
      await fetchTasks();
    }
    setActiveTask(null);
  };

  // ---------- Create New Task ----------
  const handleAddTask = async () => {
    if (!newTask.title.trim() || isSaving) return;
    setIsSaving(true);
    const taskData = { ...newTask, status: "todo" };
    const created = await createKanban(taskData);
    if (created?.success) {
      await fetchTasks();
      setNewTask({ title: "", description: "", priority: "medium", dueDate: "" });
    }
    setIsSaving(false);
  };

  // ---------- Update Task ----------
  const handleSaveEdit = async () => {
    const updated = await updateKanban(editTask.kanban_id, editTask);
    if (updated?.success) {
      await fetchTasks();
      setEditTask(null);
    }
  };

  // ---------- Delete Task ----------
  const handleDeleteTask = async (kanban_id) => {
    const deleted = await deleteKanban(kanban_id);
    if (deleted?.success) {
      await fetchTasks();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Personal Kanban Board</h1>
      {/* New Task Form */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <Input
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="w-full sm:w-40"
        />
        <Input
          placeholder="Task description"
          value={newTask.description}
          onChange={(e) =>
            setNewTask({ ...newTask, description: e.target.value })
          }
          className="w-full sm:w-60"
        />
        <Select
          value={newTask.priority}
          onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
        >
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          className="w-full sm:w-40"
        />
        <Button onClick={handleAddTask} disabled={isSaving} className="gap-2">
          <Plus className="h-4 w-4" /> {isSaving ? "Saving..." : "Add Task"}
        </Button>
      </div>

      {isLoading ? (
        <p>Loading tasks...</p>
      ) : (
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
                  items={column.tasks.map((t) => t.kanban_id)}
                  strategy={verticalListSortingStrategy}
                >
                  {column.tasks.map((task) =>
                    editTask?.kanban_id === task.kanban_id ? (
                      <div key={task.kanban_id} className="mb-3 p-4 bg-white rounded-lg">
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
                            setEditTask({ ...editTask, description: e.target.value })
                          }
                          className="mb-2"
                        />
                        <Select
                          value={editTask.priority}
                          onValueChange={(value) =>
                            setEditTask({ ...editTask, priority: value })
                          }
                        >
                          <SelectTrigger className="w-full mb-2">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="date"
                          value={editTask.dueDate}
                          onChange={(e) =>
                            setEditTask({ ...editTask, dueDate: e.target.value })
                          }
                          className="mb-2"
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleSaveEdit} size="sm" className="mr-2">
                            Save
                          </Button>
                          <Button variant="outline" onClick={() => setEditTask(null)} size="sm">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <SortableTask
                        key={task.kanban_id}
                        task={task}
                        bgColor={column.cardBg}
                        onEdit={setEditTask}
                        onDelete={handleDeleteTask}
                        userProfilePicture={user.profilePicture}  // Use authenticated user's profile picture
                      />
                    )
                  )}
                </SortableContext>
              </DroppableColumn>
            ))}
          </div>
          <DragOverlay>
            {activeTask && (
              <Card className="mb-3 cursor-move bg-blue-100 border-none shadow-lg">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-1">{activeTask.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{activeTask.description}</p>
                </CardContent>
              </Card>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

export default KanbanBoard;
