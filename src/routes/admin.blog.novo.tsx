import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { PostEditor } from "@/components/PostEditor";

export const Route = createFileRoute("/admin/blog/novo")({
  head: () => ({ meta: [{ title: "Novo post — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminShell title="Novo post"><PostEditor /></AdminShell>,
});
