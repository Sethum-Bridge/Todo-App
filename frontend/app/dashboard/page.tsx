"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import TodoItem from "@/components/TodoItem";
import TodoModal from "@/components/TodoModal";
import { Button } from "@/components/ui/button";
import { useTodos, Todo } from "@/hooks/useTodos";
import { useAuthStore } from "@/store/useAuthStore";
import { Plus, CheckCircle2, Circle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/**
 * Dashboard page component
 * Displays todos and handles todo management
 */
export default function DashboardPage() {
  const router = useRouter();
  const { todos, isLoading: loading, fetchTodos } = useTodos();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.loading);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filterTab, setFilterTab] = useState<"incomplete" | "completed">("incomplete");

  // Check authentication and fetch todos on mount
  useEffect(() => {
    let mounted = true;
    let authChecked = false;
    
    const init = async () => {
      try {
        // Always verify auth first to ensure cookies are properly set
        // This is especially important right after login
        await checkAuth();
        authChecked = true;
        
        // Add a small delay to ensure cookies are fully processed by browser
        // This is especially important right after login
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Only fetch todos if component is still mounted and auth succeeded
        if (mounted && authChecked) {
          await fetchTodos();
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to initialize dashboard:", error);
          // Only redirect if auth check failed, not if fetchTodos failed
          if (!authChecked) {
            router.push("/login");
          }
        }
      }
    };

    // Always run init on mount, even if isAuthenticated is true
    // This ensures cookies are verified and ready before fetching todos
    init();
    
    return () => {
      mounted = false;
    };
  }, []); // Only run on mount

  // Redirect if not authenticated (after loading completes)
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleAddTodo = () => {
    setEditingTodo(null);
    setModalOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setModalOpen(true);
  };

  // Filter todos based on completion status
  const filteredTodos = todos.filter((todo) =>
    filterTab === "completed" ? todo.completed : !todo.completed
  );

  // Separate filtered todos into pinned and unpinned, then sort each by creation date
  const pinnedTodos = filteredTodos
    .filter((todo) => todo.pinned)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unpinnedTodos = filteredTodos
    .filter((todo) => !todo.pinned)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalTodos = todos.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Tabs in left corner */}


        <div className="mb-6 flex items-center justify-between">
          <div> <h2 className="text-2xl font-bold">My Todos</h2>
            <p className="text-muted-foreground">
              Manage your tasks and stay organized
            </p></div>

          {totalTodos > 0 && (
            <div className="">
              <Tabs
                value={filterTab}
                onValueChange={(value) => setFilterTab(value as "incomplete" | "completed")}
              >
                <TabsList>
                  <TabsTrigger value="incomplete">
                    Not Completed
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>

        {loading && todos.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading todos...</p>
          </div>
        ) : totalTodos === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No todos yet. Create your first one!
            </p>
            <Button onClick={handleAddTodo}>
              <Plus className="h-4 w-4 mr-2" />
              Add Todo
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pinned Todos Section */}
            {pinnedTodos.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Pinned</h3>
                </div>
                <div className="space-y-3">
                  {pinnedTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onEdit={handleEditTodo}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Unpinned Todos Section */}
            {unpinnedTodos.length > 0 && (
              <div className="space-y-4">
                {pinnedTodos.length > 0 && (
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">All Todos</h3>
                  </div>
                )}
                <div className="space-y-3">
                  {unpinnedTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onEdit={handleEditTodo}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Add Button */}
        {totalTodos > 0 && (
          <Button
            onClick={handleAddTodo}
            size="lg"
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
            aria-label="Add todo"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </main>

      {/* Todo Modal */}
      <TodoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        todo={editingTodo}
      />
    </div>
  );
}

