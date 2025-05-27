import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CalendarWithSettings, createReservation } from "@/lib/actions";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ReservationDialogProps {
  slot: { start: Date; end: Date } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendar: CalendarWithSettings | null;
  selectedSlots?: { start: Date; end: Date }[];
}

const formSchema = z.object({
  customer_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  customer_email: z.string().email({ message: "Invalid email address." }),
  customer_phone: z.string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, {
      message: "Please enter a valid phone number (e.g., +1234567890 or 123-456-7890)"
    })
    .optional(),
  custom_field_1: z.string().optional(),
  custom_field_2: z.string().optional(),
  custom_field_3: z.string().optional(),
  custom_field_4: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function ReservationDialog({
  slot,
  open,
  onOpenChange,
  calendar,
  selectedSlots = [],
}: ReservationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      custom_field_1: "",
      custom_field_2: "",
      custom_field_3: "",
      custom_field_4: "",
    },
  });

  const handleSubmit = async (values: FormData) => {
    if (!slot || !calendar) return;

    setIsSubmitting(true);
    try {
      const customFields = {
        custom_field_1: values.custom_field_1 ? `${settings.custom_field_1_label}: ${values.custom_field_1}` : null,
        custom_field_2: values.custom_field_2 ? `${settings.custom_field_2_label}: ${values.custom_field_2}` : null,
        custom_field_3: values.custom_field_3 ? `${settings.custom_field_3_label}: ${values.custom_field_3}` : null,
        custom_field_4: values.custom_field_4 ? `${settings.custom_field_4_label}: ${values.custom_field_4}` : null,
      };

      // Create reservations for all selected slots
      const slotsToBook = selectedSlots.length > 0 ? selectedSlots : [slot];
      const reservations = slotsToBook.map(slot => ({
        customer_name: values.customer_name,
        customer_email: values.customer_email,
        customer_phone: values.customer_phone || null,
        start_time: slot.start,
        end_time: slot.end,
        calendar_id: calendar.id,
        ...customFields
      }));

      // Create all reservations
      await Promise.all(reservations.map(reservation => createReservation(reservation)));

      toast.success("Reservations Created", {
        description: `Successfully created ${reservations.length} reservation${reservations.length > 1 ? 's' : ''}.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error creating reservations:', error);
      toast.error("Error", {
        description: "Failed to create reservations. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!slot || !calendar?.settings?.[0]) return null;

  const settings = calendar.settings[0];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Make a Reservation</DialogTitle>
              <div className="text-sm text-muted-foreground">
                {selectedSlots.length > 0 ? (
                  <>
                    <p>Booking {selectedSlots.length} time slot{selectedSlots.length > 1 ? 's' : ''}:</p>
                    <ul className="mt-2 list-disc list-inside">
                      {selectedSlots.map((slot, index) => (
                        <li key={index}>
                          {format(slot.start, "MMMM d, yyyy")} from{" "}
                          {format(slot.start, "HH:mm")} to {format(slot.end, "HH:mm")}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>
                    Book your time slot for {format(slot.start, "MMMM d, yyyy")} from{" "}
                    {format(slot.start, "HH:mm")} to {format(slot.end, "HH:mm")}
                  </p>
                )}
              </div>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Name</FormLabel>
                    <FormControl>
                      <Input 
                        className="col-span-3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_email"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        className="col-span-3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_phone"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Phone</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel"
                        className="col-span-3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />

              {settings.custom_field_1_label && (
                <FormField
                  control={form.control}
                  name="custom_field_1"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">
                        {settings.custom_field_1_label}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          className="col-span-3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="col-span-3 col-start-2" />
                    </FormItem>
                  )}
                />
              )}

              {settings.custom_field_2_label && (
                <FormField
                  control={form.control}
                  name="custom_field_2"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">
                        {settings.custom_field_2_label}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          className="col-span-3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="col-span-3 col-start-2" />
                    </FormItem>
                  )}
                />
              )}

              {settings.custom_field_3_label && (
                <FormField
                  control={form.control}
                  name="custom_field_3"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">
                        {settings.custom_field_3_label}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          className="col-span-3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="col-span-3 col-start-2" />
                    </FormItem>
                  )}
                />
              )}

              {settings.custom_field_4_label && (
                <FormField
                  control={form.control}
                  name="custom_field_4"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">
                        {settings.custom_field_4_label}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          className="col-span-3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="col-span-3 col-start-2" />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : `Confirm ${selectedSlots.length > 0 ? selectedSlots.length : 1} Reservation${selectedSlots.length > 1 ? 's' : ''}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
