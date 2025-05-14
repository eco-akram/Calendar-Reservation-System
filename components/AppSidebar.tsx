"use client";
import {
  Calendar,
  ChevronDown,
  ChevronsUpDown,
  Home,
  Puzzle,
  Search,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarWithSettings, getCalendars } from "@/lib/actions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: Puzzle,
  },
  {
    title: "Your reservations",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [calendars, setCalendars] = useState<CalendarWithSettings[]>([]);
  const [calendarCount, setCalendarCount] = useState(0);
  const [selectedCalendar, setSelectedCalendar] =
    useState<CalendarWithSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchCalendars() {
      try {
        const data = await getCalendars();
        setCalendarCount(data.length);
        setCalendars(data);

        console.log("Fetched calendars:", data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch calendars"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCalendars();
  }, []);

  if (loading) {
    console.log("Loading calendars in the Sidebar...");
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Calendar className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">
                      {selectedCalendar
                        ? selectedCalendar.name
                        : "Pasirinkite kalendorių"}
                    </span>
                    <span className="">
                      {selectedCalendar?.description ||
                        calendarCount + " kalendorių"}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-[250px]">
                {calendars.map((calendar) => (
                  <DropdownMenuItem
                    key={calendar.id}
                    onClick={() => {
                      setSelectedCalendar(calendar); // Update the selected calendar
                      router.push(`/calendar/${calendar.id}`); // Redirect to the calendar's page
                    }}
                  >
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">{calendar.name}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
              {/* 
              <DropdownMenuContent className="w-[250px]">
                <DropdownMenuItem>
                  <span>Acme Inc</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Acme Corp.</span>
                </DropdownMenuItem>
              </DropdownMenuContent> */}
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarMenu>
      </SidebarHeader>
    </Sidebar>
  );
}
