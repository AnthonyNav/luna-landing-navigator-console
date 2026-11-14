import { SiteSelector } from './SiteSelector'
import { DateConfigurator } from './DateConfigurator'
import { VerdictBanner } from './VerdictBanner'
import { TelemetryCards } from './TelemetryCards'

export function Sidebar() {
  return (
    <div className="flex flex-col gap-5">
      <SiteSelector />
      <DateConfigurator />
      <VerdictBanner />
      <TelemetryCards />
    </div>
  )
}
