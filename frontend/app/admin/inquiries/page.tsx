import type { Metadata } from "next"
import { Check, Inbox, Mail, MessageSquare, Phone, Smartphone } from "lucide-react"
import { AdminHeader } from "@/components/admin/admin-header"
import { EmptyState } from "@/components/admin/admin-empty"
import { FilterTab, FilterTabs } from "@/components/admin/admin-tabs"
import { Initials } from "@/components/admin/admin-avatar"
import { Button } from "@/components/ui/button"
import { Stagger, StaggerItem } from "@/components/motion/reveal"
import { toggleInquiryAction } from "@/app/actions/admin"
import { api } from "@/lib/api"
import type { AdminInquiryList } from "@/lib/api-types"
import { sessionToken } from "@/lib/auth"
import { formatDateTime } from "@/lib/format"
import { whatsappLink } from "@/lib/site"
import { cn } from "@/lib/utils"
import { digits } from "@/lib/validation"

export const metadata: Metadata = { title: "Inquiries" }

export const dynamic = "force-dynamic"

const TYPE_LABEL: Record<string, string> = {
  SELL_DEVICE: "Selling a device",
  GENERAL: "General question",
  REPAIR: "Repair",
  BULK: "Bulk / corporate",
}

const CONDITION_LABEL: Record<string, string> = {
  WORKING: "Fully working",
  MINOR_FAULT: "Minor fault",
  FAULTY: "Faulty",
  UNKNOWN: "Not sure",
}

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value
  return v?.trim() ?? ""
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const show = first(sp.show) === "handled" ? "handled" : "open"

  const listing = await api.get<AdminInquiryList>(
    `/api/admin/inquiries?show=${show}`,
    await sessionToken(),
  )

  const { inquiries, openCount, handledCount } = listing

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Inquiries"
        description="Leads from the contact form and the sell-your-device page — answer on WhatsApp and tick them off as you go."
        meta={
          openCount > 0 && show === "open" ? (
            <p className="text-xs font-medium text-muted-foreground">
              <span className="mr-1.5 inline-block size-1.5 rounded-full bg-success align-middle" />
              {openCount} {openCount === 1 ? "person is" : "people are"} waiting on a reply
            </p>
          ) : undefined
        }
      />

      <FilterTabs>
        <FilterTab href="/admin/inquiries" active={show === "open"} count={openCount}>
          Open
        </FilterTab>
        <FilterTab href="/admin/inquiries?show=handled" active={show === "handled"} count={handledCount}>
          Handled
        </FilterTab>
      </FilterTabs>

      {inquiries.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={show === "open" ? "Nothing waiting" : "No handled inquiries yet"}
          description={
            show === "open"
              ? "You're all caught up — new leads will show up here."
              : "Once you tick a lead off it will be filed here."
          }
        />
      ) : (
        <Stagger className="flex flex-col gap-3">
          {inquiries.map((inquiry) => {
            const waNumber = digits(inquiry.phone).replace(/^0/, "92")
            return (
              <StaggerItem key={inquiry.id} y={10}>
                <article
                  className={cn(
                    "rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-colors",
                    inquiry.handled
                      ? "opacity-70"
                      : "hover:border-brand/30",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3.5">
                      <Initials name={inquiry.name} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{inquiry.name}</span>
                          <span className="rounded-md bg-brand-subtle px-1.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-brand uppercase">
                            {TYPE_LABEL[inquiry.type] ?? inquiry.type}
                          </span>
                          {inquiry.handled && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-success-subtle px-1.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-success uppercase">
                              <Check className="size-3" />
                              Handled
                            </span>
                          )}
                        </div>

                        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <a
                            href={`tel:${digits(inquiry.phone)}`}
                            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                          >
                            <Phone className="size-3" />
                            {inquiry.phone}
                          </a>
                          {inquiry.email && (
                            <a
                              href={`mailto:${inquiry.email}`}
                              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                            >
                              <Mail className="size-3" />
                              {inquiry.email}
                            </a>
                          )}
                          <span>{formatDateTime(inquiry.createdAt)}</span>
                        </p>

                        {inquiry.device && (
                          <p className="mt-3 flex items-start gap-2 rounded-xl bg-muted px-3 py-2 text-sm">
                            <Smartphone className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                            <span className="min-w-0">
                              <span className="font-medium">{inquiry.device}</span>
                              {inquiry.condition && (
                                <span className="text-muted-foreground">
                                  {" · "}
                                  {CONDITION_LABEL[inquiry.condition] ?? inquiry.condition}
                                </span>
                              )}
                            </span>
                          </p>
                        )}

                        {inquiry.message && (
                          <p className="mt-3 border-l-2 border-brand/40 pl-3 text-sm leading-relaxed text-muted-foreground">
                            {inquiry.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        nativeButton={false}
                        render={
                          <a
                            href={whatsappLink(
                              `Hi ${inquiry.name}, thanks for getting in touch with Dani Brothers —`,
                              waNumber,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <MessageSquare />
                        Reply
                      </Button>

                      <form action={toggleInquiryAction}>
                        <input type="hidden" name="id" value={inquiry.id} />
                        <Button type="submit" size="sm" variant="ghost">
                          <Check />
                          {inquiry.handled ? "Reopen" : "Mark handled"}
                        </Button>
                      </form>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            )
          })}
        </Stagger>
      )}
    </div>
  )
}
