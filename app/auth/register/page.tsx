import Header from "@/components/Header";
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
      <Header title="Registracija" />
      <div className="flex flex-col w-full gap-4 p-4 mt-35"> 
        <RegisterForm />
      </div>
    </main>
  );
}
