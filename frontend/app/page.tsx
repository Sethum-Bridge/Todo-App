import { redirect } from "next/navigation";

/**
 * Root page - redirects to dashboard
 * Client-side will handle redirect to login if not authenticated
 */
export default function Home() {
  redirect("/dashboard");
}
