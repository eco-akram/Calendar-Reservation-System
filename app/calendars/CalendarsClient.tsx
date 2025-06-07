"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Settings,
  Clock,
  Calendar as CalendarIcon,
  Trash2,
  Edit2,
  Users,
  CalendarDays,
  Timer,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getCalendars, type CalendarWithSettings } from "@/lib/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CalendarFormData {
  name: string;
  description: string;
  slot_duration_minutes: number;
  allow_multiple_bookings: boolean;
  min_booking_notice_days: number;
  max_booking_days_ahead: number;
  working_hours: {
    [key: string]: {
      start: string;
      end: string;
      enabled: boolean;
    };
  };
  special_days: {
    date: string;
    is_working_day: boolean;
    working_hours?: {
      start: string;
      end: string;
    };
  }[];
}

const DAYS_OF_WEEK = [
  { value: "monday", label: "Pirmadienis" },
  { value: "tuesday", label: "Antradienis" },
  { value: "wednesday", label: "Trečiadienis" },
  { value: "thursday", label: "Ketvirtadienis" },
  { value: "friday", label: "Penktadienis" },
  { value: "saturday", label: "Šeštadienis" },
  { value: "sunday", label: "Sekmadienis" },
];

export default function CalendarsClient() {
  const [calendars, setCalendars] = useState<CalendarWithSettings[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<CalendarFormData>({
    name: "",
    description: "",
    slot_duration_minutes: 30,
    allow_multiple_bookings: false,
    min_booking_notice_days: 1,
    max_booking_days_ahead: 30,
    working_hours: DAYS_OF_WEEK.reduce(
      (acc, day) => ({
        ...acc,
        [day.value]: {
          start: "09:00",
          end: "17:00",
          enabled: day.value !== "saturday" && day.value !== "sunday",
        },
      }),
      {}
    ),
    special_days: [],
  });

  useEffect(() => {
    loadCalendars();
  }, []);

  const loadCalendars = async () => {
    try {
      const data = await getCalendars();
      setCalendars(data);
    } catch {
      toast.error("Klaida užkraunant kalendorius");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // TODO: Implement calendar creation
      toast.success("Kalendorius sėkmingai sukurtas");
      await loadCalendars();
    } catch {
      toast.error("Klaida kuriant kalendorių");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCalendar) return;

    try {
      // TODO: Implement calendar deletion
      toast.success("Kalendorius sėkmingai ištrintas");
      await loadCalendars();
    } catch {
      toast.error("Klaida ištrinant kalendorių");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedCalendar(null);
    }
  };

  const handleDateSelect = (date: Date | undefined, index: number) => {
    if (date) {
      // Adjust for timezone by setting the time to noon
      date.setHours(12, 0, 0, 0);
      const newSpecialDays = [...formData.special_days];
      newSpecialDays[index] = {
        ...newSpecialDays[index],
        date: date.toISOString().split("T")[0],
      };
      setFormData({
        ...formData,
        special_days: newSpecialDays,
      });
    }
  };

  const handleTimeChange = (
    day: string,
    type: "start" | "end",
    value: string
  ) => {
    setFormData({
      ...formData,
      working_hours: {
        ...formData.working_hours,
        [day]: {
          ...formData.working_hours[day],
          [type]: value,
        },
      },
    });
  };

  if (isLoading) {
    return (
      <main className="w-full rounded-3xl m-2 bg-background">
        <Header title="Kalendorių nustatymai" />
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full rounded-3xl m-2 bg-background">
      <Header title="Kalendorių nustatymai" />
      <div className="flex flex-col gap-6 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Jūsų kalendoriai</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Naujas kalendorius
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Sukurti naują kalendorių</DialogTitle>
                <DialogDescription>
                  Įveskite kalendoriaus informaciją ir nustatymus.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Tabs defaultValue="general">
                  <TabsList>
                    <TabsTrigger value="general">Bendri nustatymai</TabsTrigger>
                    <TabsTrigger value="working-hours">
                      Darbo valandos
                    </TabsTrigger>
                    <TabsTrigger value="special-days">
                      Specialios dienos
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="general">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4 p-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Pavadinimas</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Aprašymas</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="slot_duration">
                            Laiko tarpas (minutėmis)
                          </Label>
                          <Select
                            value={formData.slot_duration_minutes.toString()}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                slot_duration_minutes: parseInt(value),
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 min</SelectItem>
                              <SelectItem value="30">30 min</SelectItem>
                              <SelectItem value="45">45 min</SelectItem>
                              <SelectItem value="60">1 val</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="multiple_bookings">
                            Leisti kelias rezervacijas
                          </Label>
                          <Switch
                            id="multiple_bookings"
                            checked={formData.allow_multiple_bookings}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                allow_multiple_bookings: checked,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="min_notice">
                            Minimalus įspėjimo laikas (dienomis)
                          </Label>
                          <Input
                            id="min_notice"
                            type="number"
                            min="0"
                            value={formData.min_booking_notice_days}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                min_booking_notice_days: parseInt(
                                  e.target.value
                                ),
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max_ahead">
                            Maksimalus rezervavimo laikas (dienomis)
                          </Label>
                          <Input
                            id="max_ahead"
                            type="number"
                            min="1"
                            value={formData.max_booking_days_ahead}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                max_booking_days_ahead: parseInt(
                                  e.target.value
                                ),
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="working-hours">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4 p-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <div
                            key={day.value}
                            className="space-y-2 p-2 border rounded-lg bg-accent/20"
                          >
                            <div className="flex items-center justify-between">
                              <p>{day.label}</p>
                              <Switch
                                checked={
                                  formData.working_hours[day.value].enabled
                                }
                                onCheckedChange={(checked) =>
                                  setFormData({
                                    ...formData,
                                    working_hours: {
                                      ...formData.working_hours,
                                      [day.value]: {
                                        ...formData.working_hours[day.value],
                                        enabled: checked,
                                      },
                                    },
                                  })
                                }
                              />
                            </div>
                            {formData.working_hours[day.value].enabled && (
                              <div className="flex gap-4">
                                <div className="flex-1">
                                  <Label className="pb-2">Pradžia</Label>
                                  <Input
                                    type="time"
                                    value={
                                      formData.working_hours[day.value].start
                                    }
                                    onChange={(e) =>
                                      handleTimeChange(
                                        day.value,
                                        "start",
                                        e.target.value
                                      )
                                    }
                                    className="bg-background"
                                  />
                                </div>
                                <div className="flex-1">
                                  <Label className="pb-2">Pabaiga</Label>
                                  <Input
                                    type="time"
                                    value={
                                      formData.working_hours[day.value].end
                                    }
                                    onChange={(e) =>
                                      handleTimeChange(
                                        day.value,
                                        "end",
                                        e.target.value
                                      )
                                    }
                                    className="bg-background"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="special-days">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4 p-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">
                            Specialios dienos
                          </h3>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                special_days: [
                                  ...formData.special_days,
                                  {
                                    date: new Date()
                                      .toISOString()
                                      .split("T")[0],
                                    is_working_day: false,
                                  },
                                ],
                              })
                            }
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Pridėti dieną
                          </Button>
                        </div>
                        <div className="mt-2 border border-dashed rounded-lg min-h-[330px]">
                          {formData.special_days.map((day, index) => (
                            <div
                              key={index}
                              className="space-y-2 p-2 m-2 border rounded-lg bg-accent/20"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex gap-4">
                                  <Label className="p-1">Data:</Label>
                                  <Popover modal={true}>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-[200px] justify-between font-normal"
                                      >
                                        {day.date
                                          ? new Date(
                                              day.date + "T12:00:00"
                                            ).toLocaleDateString("lt-LT")
                                          : "Pasirinkite datą"}
                                        <CalendarIcon className="h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      key={day.date}
                                      className="w-auto p-0"
                                      align="start"
                                    >
                                      <Calendar
                                        mode="single"
                                        selected={
                                          day.date
                                            ? new Date(day.date + "T12:00:00")
                                            : undefined
                                        }
                                        onSelect={(date) =>
                                          handleDateSelect(date, index)
                                        }
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="ml-2"
                                  onClick={() => {
                                    const newSpecialDays = [
                                      ...formData.special_days,
                                    ];
                                    newSpecialDays.splice(index, 1);
                                    setFormData({
                                      ...formData,
                                      special_days: newSpecialDays,
                                    });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>

                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? "Kuriama..." : "Sukurti kalendorių"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {calendars.map((calendar) => (
            <div
              key={calendar.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="grid">
                  <h3 className="text-xl font-semibold">{calendar.name}</h3>
                  {calendar.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3 min-h-[4.5em]">
                      {calendar.description}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Redaguoti
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      Darbo valandos
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Specialios dienos
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        setSelectedCalendar(calendar.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Ištrinti
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {calendar.settings && calendar.settings.length > 0 && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      Laiko intervalas:{" "}
                      {calendar.settings[0].slot_duration_minutes} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      Kelios rezervacijos:{" "}
                      {calendar.settings[0].allow_multiple_bookings
                        ? "Leidžiamos"
                        : "Neleidžiamos"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    <span>
                      Įspėjimo laikas:{" "}
                      {calendar.settings[0].min_booking_notice_days} d.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      Maksimalus rezervavimo laikas:{" "}
                      {calendar.settings[0].max_booking_days_ahead} d.
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Ar tikrai norite ištrinti šį kalendorių?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Šis veiksmas negali būti atšauktas. Tai ištrins visus susijusius
              rezervavimus ir nustatymus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Atšaukti</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Ištrinti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
