"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { login } from "@/lib/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email({ message: "Neteisingas el. pašto adresas." }),
  password: z
    .string()
    .min(6, { message: "Slaptažodis turi būti bent 6 simbolių." }),
});

export default function LoginForm() {
  const router = useRouter();
  //* 1. Define your form.

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  //* 2. Define a submit handler.

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);

    const error = await login(formData); 
    if (error) {
      toast.error(error); 
    } else {
      toast.success("Login successful!");
      router.push("/"); // Redirect to the dashboard
    }
  }

  return (
    <main className="flex items-center justify-center ">
      <div className="w-full max-w-md flex flex-col border rounded-lg gap-4 p-4 bg-accent/20 shadow-lg">
        <div>
          <p className="text-center text-2xl font-bold">
            Prisijunkite prie savo administratoriaus paskyros
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Įveskite savo el. paštą, kad prisijungtumėte prie paskyros
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>El. paštas</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Įveskite savo el. paštą"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slaptažodis</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Įveskite savo slaptažodį"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Prisijungti
            </Button>
          </form>
        </Form>
        <div className="text-center text-sm">
          Neturite paskyros?{" "}
          <Link href="register" className="underline underline-offset-4">
            Registruotis
          </Link>
        </div>
      </div>
    </main>
  );
}
