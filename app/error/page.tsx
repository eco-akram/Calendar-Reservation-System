"use client";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function ErrorPage() {
  return (
    <main className="w-full rounded-3xl m-2 bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 ">Oops!</h1>
        <p className="text-lg mb-2">Kažkas nutiko ne taip.</p>
        <Button className="" onClick={() => redirect("/")}>
          Atgal į pagrindinį
        </Button>
      </div>
    </main>
  );
}
