"use client";
import {
  Calendar,
  ChevronsUpDown,
  Home,
  Puzzle,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
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
import { useRouter, usePathname } from "next/navigation";

const items = [
  {
    title: "Pradžia",
    url: "/",
    icon: Home,
  },
  {
    title: "Integracijos",
    url: "/integrations",
    icon: Puzzle,
  },
  {
    title: "Jūsų rezervacijos",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Nustatymai",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [calendars, setCalendars] = useState<CalendarWithSettings[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarWithSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchCalendars() {
      try {
        const data = await getCalendars();
        setCalendars(data);

        // Get the current path
        const calendarMatch = pathname.match(/\/calendar\/([^\/]+)/);
        
        if (calendarMatch) {
          // If we're on a calendar page, select that calendar
          const calendarId = calendarMatch[1];
          const currentCalendar = data.find(c => c.id === calendarId);
          if (currentCalendar) {
            setSelectedCalendar(currentCalendar);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch calendars");
      } finally {
        setLoading(false);
      }
    }

    fetchCalendars();
  }, [pathname]);

  const handleCalendarSelect = (calendar: CalendarWithSettings) => {
    setSelectedCalendar(calendar);
    router.push(`/calendar/${calendar.id}`);
  };

  if (loading) {
    return (
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" disabled>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary/50 text-sidebar-primary-foreground/50">
                  <Calendar className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Kraunami kalendoriai...</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      </Sidebar>
    );
  }

  if (error) {
    return (
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" disabled>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-red-500/50 text-red-500-foreground">
                  <Calendar className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-red-500">Klaida kraunant kalendorius</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      </Sidebar>
    );
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
                      {selectedCalendar ? selectedCalendar.name : "Pasirinkite kalendorių"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {calendars.length} kalendori{calendars.length === 1 ? 'us' : 'ai'} prieinami
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-[250px]">
                {calendars.map((calendar) => (
                  <DropdownMenuItem
                    key={calendar.id}
                    onClick={() => handleCalendarSelect(calendar)}
                    className={selectedCalendar?.id === calendar.id ? "bg-accent" : ""}
                  >
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">{calendar.name}</span>
                      {calendar.description && (
                        <span className="text-sm text-muted-foreground truncate">
                          {calendar.description}
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon className="size-4" />
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
