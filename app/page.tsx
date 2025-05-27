import Header from "@/components/Header";
import Image from "next/image";
import CalendarList from "@/components/CalendarList";

export default function Home() {
  return (
    <main className="w-full rounded-3xl bg-background" >
      <Header title="Home" />
      <div className="flex flex-col gap-4 p-4">
        <p>TEXT</p>
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <CalendarList />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-black" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </main>
  );
}
