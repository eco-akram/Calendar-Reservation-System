import Image from "next/image";
import ThemeToggle from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Header from "@/components/Header";

export default function page() {
  return (
    <main className="w-full">
      <Header title="Settings" />
      <div className="flex flex-col gap-4 p-4">
        <ThemeToggle />
        <p>TEXT</p>
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-black" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </main>
  );
}
