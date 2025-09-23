import { MainNav, MainFooter } from "@/components/navigation/MainNav"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <main className="flex-1">
        {children}
      </main>
      <MainFooter />
    </div>
  )
}