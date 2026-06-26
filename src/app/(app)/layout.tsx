import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="pb-nav">{children}</main>
      <BottomNav />
    </>
  );
}
