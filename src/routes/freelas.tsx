import { createFileRoute, Outlet } from "@tanstack/react-router";
import { FreelasFloatingMenu } from "@/components/FreelasFloatingMenu";

export const Route = createFileRoute("/freelas")({
  component: () => (
    <>
      <Outlet />
      <FreelasFloatingMenu />
    </>
  ),
});
