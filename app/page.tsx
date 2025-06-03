import Header from "@/components/Header";
import Image from "next/image";
import CalendarList from "@/components/CalendarList";
import ConfirmHandler from "@/components/auth/ConfirmHandler"; 

export default function Home() {
  return (
    <main className="w-full rounded-3xl m-2 bg-background" >
      <ConfirmHandler />
      <Header title="Home" />
      <div className="flex flex-col gap-4 p-4">
          <CalendarList />
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-black" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-gradient-to-t from-primary/5 to-card border shadow-md" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </main>
  );
}
