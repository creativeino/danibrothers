import { Banknote } from "lucide-react"
import { StatCard } from "@/components/admin/admin-stat"
import { Stagger, StaggerItem } from "@/components/motion/reveal"

export default function StatTestPage() {
  return (
    <Stagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StaggerItem>
        <StatCard
          icon={<Banknote />}
          label="Revenue"
          value={1234}
          format="currency"
          tone="success"
          hint="Excludes cancelled orders"
        />
      </StaggerItem>
    </Stagger>
  )
}
