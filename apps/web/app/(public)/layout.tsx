import { MainFooter } from "@/components/navigation/MainNav"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <MainFooter />
    </>
  )
}