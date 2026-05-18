import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { PostEditor } from "@/components/PostEditor";

export const Route = createFileRoute("/admin/blog/$id")({
  head: () => ({ meta: [{ title: "Editar post — Admin" }, { name: "robots", content: "noindex" }] }),
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  return <AdminShell title="Editar post"><PostEditor postId={id} /></AdminShell>;
}
