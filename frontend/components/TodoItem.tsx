"use client";

import { Button } from "@/components/ui/button";
import { useTodos } from "@/hooks/useTodos";
import { formatDate, isOverdue } from "@/lib/helpers";
import { Todo } from "@/hooks/useTodos";
import { Edit2, Trash2, Pin, PinOff, CheckCircle2, Circle } from "lucide-react";

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
}

/**
 * Single todo item component
 * Displays todo details and action buttons
 */
export default function TodoItem({ todo, onEdit }: TodoItemProps) {
  const { togglePin, toggleComplete, deleteTodo } = useTodos();

  const overdue = isOverdue(todo.dueDate);
  const dueDateText = todo.dueDate ? formatDate(todo.dueDate) : "";

  return (
    <div
      className={`group flex items-start gap-3 rounded-lg border p-4 transition-all hover:shadow-md ${
        todo.completed
          ? "bg-muted/50 opacity-75"
          : "bg-background"
      } ${todo.pinned ? "border-primary" : ""} ${overdue && !todo.completed ? "border-destructive/50" : ""}`}
    >
      {/* Complete toggle */}
      <button
        onClick={() => toggleComplete(todo.id)}
        className="mt-0.5 text-muted-foreground hover:text-primary transition-colors"
        aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
      >
        {todo.completed ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      {/* Todo content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h3
            className={`flex-1 font-medium ${
              todo.completed
                ? "line-through text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {todo.title}
          </h3>
        </div>
        {dueDateText && (
          <p
            className={`text-sm mt-1 ${
              overdue && !todo.completed
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            Due: {dueDateText}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => togglePin(todo.id)}
          aria-label={todo.pinned ? "Unpin" : "Pin"}
        >
          {todo.pinned ? (
            <PinOff className="h-4 w-4" />
          ) : (
            <Pin className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(todo)}
          aria-label="Edit todo"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => deleteTodo(todo.id)}
          aria-label="Delete todo"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

