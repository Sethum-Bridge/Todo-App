import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/app/api/axiosClient";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  pinned: boolean;
  userId: string;
  createdAt: string;
}

/**
 * Fetch all todos from the API
 */
const fetchTodosFn = async (): Promise<Todo[]> => {
  const response = await axiosClient.get<Todo[]>("/todos");
  return response.data;
};

/**
 * Custom hook for managing todos with React Query
 * Provides query data and mutations with optimistic updates
 */
export function useTodos() {
  const queryClient = useQueryClient();

  // Query for fetching todos
  const {
    data: todos = [],
    isLoading,
    isError,
    error,
    refetch: fetchTodos,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodosFn,
    enabled: false, // Disable automatic fetching - will be triggered manually after auth check
  });

  // Mutation for adding a todo
  const addTodoMutation = useMutation({
    mutationFn: async (todoData: Omit<Todo, "id" | "userId" | "createdAt">) => {
      const response = await axiosClient.post<Todo>("/todos", todoData);
      return response.data;
    },
    onMutate: async (newTodo) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // Optimistically update
      const tempId = `temp-${Date.now()}`;
      const optimisticTodo: Todo = {
        ...newTodo,
        id: tempId,
        userId: "",
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Todo[]>(["todos"], (old = []) => [
        optimisticTodo,
        ...old,
      ]);

      // Return context with snapshot
      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData<Todo[]>(["todos"], context.previousTodos);
      }
    },
    onSuccess: (data, variables, context) => {
      // Replace optimistic todo with real one
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) =>
        old.map((t) => (t.id.startsWith("temp-") ? data : t))
      );
    },
    onSettled: () => {
      // Refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // Mutation for updating a todo
  const updateTodoMutation = useMutation({
    mutationFn: async ({
      id,
      todoData,
    }: {
      id: string;
      todoData: Partial<Todo>;
    }) => {
      const response = await axiosClient.put<Todo>(`/todos/${id}`, todoData);
      return response.data;
    },
    onMutate: async ({ id, todoData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // Optimistically update
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, ...todoData } : t))
      );

      // Return context with snapshot
      return { previousTodos };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData<Todo[]>(["todos"], context.previousTodos);
      }
    },
    onSuccess: (data, variables) => {
      // Update with server response
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) =>
        old.map((t) => (t.id === variables.id ? data : t))
      );
    },
    onSettled: () => {
      // Refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // Mutation for deleting a todo
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosClient.delete(`/todos/${id}`);
      return id;
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // Optimistically update
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) =>
        old.filter((t) => t.id !== id)
      );

      // Return context with snapshot
      return { previousTodos };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData<Todo[]>(["todos"], context.previousTodos);
      }
    },
    onSettled: () => {
      // Refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // Helper functions for common operations
  const addTodo = async (todoData: Omit<Todo, "id" | "userId" | "createdAt">) => {
    return addTodoMutation.mutateAsync(todoData);
  };

  const updateTodo = async (id: string, todoData: Partial<Todo>) => {
    return updateTodoMutation.mutateAsync({ id, todoData });
  };

  const deleteTodo = async (id: string) => {
    return deleteTodoMutation.mutateAsync(id);
  };

  const togglePin = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    return updateTodo(id, { pinned: !todo.pinned });
  };

  const toggleComplete = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    return updateTodo(id, { completed: !todo.completed });
  };

  return {
    todos,
    isLoading,
    isError,
    error,
    fetchTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    togglePin,
    toggleComplete,
    // Expose mutations for direct access if needed
    addTodoMutation,
    updateTodoMutation,
    deleteTodoMutation,
  };
}
