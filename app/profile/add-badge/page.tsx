import officialBadgeLibrary from "../../data/officialBadgeLibrary.json"
import AddBadgeClientPage from "./AddBadgeClientPage"

export default function AddBadgePage({
  searchParams
}: {
  searchParams?: { edit?: string }
}) {
  return (
    <AddBadgeClientPage
      officialBadges={officialBadgeLibrary}
      editId={searchParams?.edit || ""}
    />
  )
}
