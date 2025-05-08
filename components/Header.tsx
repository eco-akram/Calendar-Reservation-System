import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/theme-toggle";
import { ShieldUser } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <div className="flex h-16 w-full items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-2" />
      <div className="flex flex-1 items-baseline justify-between gap-2">
        <p className="text-2xl">{title}</p>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <a href={"/admin"}>
              <ShieldUser className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
              <span className="sr-only">Admin</span>
            </a>
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
