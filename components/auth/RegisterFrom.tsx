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

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signup } from "@/lib/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formSchema = z
  .object({
    name: z.string().min(3, { message: "Vardas turi būti bent 3 simbolių." }),
    email: z.string().email({ message: "Neteisingas el. pašto adresas." }),
    password: z
      .string()
      .min(6, { message: "Slaptažodis turi būti bent 6 simbolių." }),
    confirmPassword: z
      .string()
      .min(6, { message: "Slaptažodis turi būti bent 6 simbolių." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Slaptažodžiai turi sutapti.",
  });

export default function RegisterForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("password", values.password);

    const error = await signup(formData);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Registration successful! Please confirm your email.");
      router.push("/");
    }
  }

  return (
    <main className="flex items-center justify-center">
      <div className="w-full max-w-md flex flex-col gap-4 p-4 border rounded-lg bg-accent/20 shadow-lg">
        <div>
          <p className="text-center text-2xl font-bold">Sukurti paskyrą</p>
          <p className="text-center text-sm text-muted-foreground">
            Įveskite savo el. paštą, kad prisijungtumėte prie paskyros
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vardas</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Įveskite savo vardą"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patvirtinkite slaptažodį</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Patvirtinkite savo slaptažodį"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Registruotis
            </Button>
          </form>
        </Form>
        <div className="text-center text-sm">
          Jau turite paskyrą?{" "}
          <Link href="login" className="underline underline-offset-4">
            Prisijungti
          </Link>
        </div>
      </div>
    </main>
  );
}
