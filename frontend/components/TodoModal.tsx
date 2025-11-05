"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTodos, Todo } from "@/hooks/useTodos";
import { formatDateForInput } from "@/lib/helpers";

interface TodoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo?: Todo | null;
}

/**
 * Modal component for adding/editing todos
 * Uses ShadCN Dialog component
 */
export default function TodoModal({
  open,
  onOpenChange,
  todo,
}: TodoModalProps) {
  const { addTodo, updateTodo } = useTodos();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    completed: false,
    pinned: false,
    dueDate: "",
  });

  // Reset form when modal opens/closes or todo changes
  useEffect(() => {
    if (open) {
      if (todo) {
        setFormData({
          title: todo.title,
          completed: todo.completed,
          pinned: todo.pinned,
          dueDate: todo.dueDate ? formatDateForInput(todo.dueDate) : "",
        });
      } else {
        setFormData({
          title: "",
          completed: false,
          pinned: false,
          dueDate: "",
        });
      }
    }
  }, [open, todo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const todoData = {
        title: formData.title,
        completed: formData.completed,
        pinned: formData.pinned,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };

      if (todo) {
        await updateTodo(todo.id, todoData);
      } else {
        await addTodo(todoData);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save todo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{todo ? "Edit Todo" : "Add Todo"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter todo title"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.completed}
                  onChange={(e) =>
                    setFormData({ ...formData, completed: e.target.checked })
                  }
                  disabled={loading}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium">Completed</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pinned}
                  onChange={(e) =>
                    setFormData({ ...formData, pinned: e.target.checked })
                  }
                  disabled={loading}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium">Pinned</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : todo ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

