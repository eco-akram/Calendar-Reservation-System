"use client";
import {
  Calendar,
  CalendarCog,
  ChevronsUpDown,
  Home,
  LogIn,
  LogOut,
  Puzzle,
  Settings,
  ShieldUser,
  UserPen,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
import { createClient } from "@/utils/supabase/client";
import LogoutButton from "./auth/LogoutButton";
import { User } from "@supabase/supabase-js";

const data = {
  items: [
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
  ],
  admin: [
    {
      name: "Kalendoriu nustatymai",
      url: "/calendars",
      icon: CalendarCog,
    },
    {
      name: "Visos rezervacijos",
      url: "/reservations",
      icon: UserPen,
    },
  ],
};

export function AppSidebar() {
  const [calendars, setCalendars] = useState<CalendarWithSettings[]>([]);
  const [selectedCalendar, setSelectedCalendar] =
    useState<CalendarWithSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
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
          const currentCalendar = data.find((c) => c.id === calendarId);
          if (currentCalendar) {
            setSelectedCalendar(currentCalendar);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch calendars"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCalendars();
  }, [pathname]);

  useEffect(() => {
    async function fetchUser() {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.log("Error fetching user:", error.message);
      } else if (user) {
        setUser(user);
        console.log("Fetched user:", user);
      }
    }

    fetchUser();
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
                  <span className="font-semibold text-red-500">
                    Klaida kraunant kalendorius
                  </span>
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
                      {selectedCalendar
                        ? selectedCalendar.name
                        : "Pasirinkite kalendorių"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {calendars.length} kalendori
                      {calendars.length === 1 ? "us" : "ai"} prieinami
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
                    className={
                      selectedCalendar?.id === calendar.id ? "bg-accent" : ""
                    }
                  >
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">{calendar.name}</span>
                      {/*                       {calendar.description && (
                        <span className="text-sm text-muted-foreground truncate">
                          {calendar.description}
                        </span>
                      )} */}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/*         <SidebarGroupLabel>Administracija</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {data.items.map((item) => (
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
          </SidebarGroupContent>
        </SidebarGroup>
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>Administracija</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.admin.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.name}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {user ? (
        <SidebarFooter>
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent ">
            <div className="flex items-center gap-2 text-sm ">
              <ShieldUser
                className="bg-card/50 border rounded-lg p-2 text-primary"
                size={40}
              />
              <div className="grid flex-1 text-left leading-tight">
                <span className="font-medium truncate">
                  {user.user_metadata.display_name}
                </span>
                <span className="text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
            </div>
            {/*             <LogOut color="gray" size={25} /> */}
            <LogoutButton />
          </div>
        </SidebarFooter>
      ) : (
        <SidebarFooter>
          <div className="flex items-center justify-center p-2 mb-4 rounded-lg hover:bg-accent ">
            <a className="flex gap-2 items-center" href={"/auth/login"}>
              <LogIn className="text-muted-foreground" size={15} />
              <span className="text-muted-foreground truncate text-sm">
                Prisijungkti kaip administratorius
              </span>
            </a>
          </div>
        </SidebarFooter>
      )}
      {/*       <SidebarFooter>
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent ">
          <div className="flex items-center gap-2 text-sm ">
            <ShieldUser
              className="bg-card/50 border rounded-lg p-2 text-primary"
              size={40}
            />
            <div className="grid flex-1 text-left leading-tight">
              <span className="font-medium ">Username</span>
              <span className="text-muted-foreground ">email@gmail.com</span>
            </div>
          </div>
          <LogOut color="gray" size={15} />
        </div>
      </SidebarFooter> */}
    </Sidebar>
  );
}
