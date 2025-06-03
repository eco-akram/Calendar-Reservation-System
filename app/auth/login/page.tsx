import Image from "next/image";
import ThemeToggle from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterFrom";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function page() {

    const supabase = await createClient()
  
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (user) {
      redirect('/')
    }

  return (
    <main className="w-full rounded-3xl m-2 bg-background">
      <Header title="Admin Login" />
      <div className="flex flex-col gap-4 p-4 mt-50">
        <LoginForm />
      </div>
    </main>
  );
}
