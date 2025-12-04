import { InsightsView } from "@/components/analytics/insights-view"

export default function InsightsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-lg font-semibold md:text-2xl">Insights</h1>
                <p className="text-sm text-muted-foreground">
                    Track your productivity and team performance.
                </p>
            </div>
            <InsightsView />
        </div>
    )
}
