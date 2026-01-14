import { redirect } from "next/navigation";

export default function Home() {
  // Langsung redirect ke dashboard
  redirect("/dashboard");
}