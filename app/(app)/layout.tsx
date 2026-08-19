import { SideNav } from "@/app/components/SideNav";
import { TopBar } from "@/app/components/TopBar";
import { BottomNav } from "@/app/components/BottomNav";

/** Chrome for the working app: sidebar + top bar (desktop), bottom tabs
 *  (mobile). The /welcome scroll story sits outside this group and stays
 *  full-bleed — it has no use for app navigation. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SideNav />
      <TopBar />
      <main className="min-h-screen px-4 pb-24 pt-24 md:pl-64 md:px-6 md:pb-10 md:pt-24">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
      <BottomNav />
    </>
  );
}
