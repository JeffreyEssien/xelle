import { getAuditLogs } from "@/lib/queries";
import type { AuditLog } from "@/types";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
    "admin.login": "Signed in",
    "admin.login_legacy": "Signed in (legacy)",
    "order.status_changed": "Order status changed",
    "order.payment_confirmed": "Payment confirmed",
    "order.created_manual": "Order created (manual)",
    "product.deleted": "Product deleted",
    "review.approved": "Review approved",
    "review.hidden": "Review hidden",
    "review.deleted": "Review deleted",
};

function fmt(iso: string) {
    return new Date(iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}

export default async function AuditLogPage() {
    const logs: AuditLog[] = await getAuditLogs(200);

    return (
        <div className="max-w-5xl">
            <header className="mb-6">
                <h1 className="font-serif text-2xl text-brand-dark">Audit Log</h1>
                <p className="text-brand-dark/50 text-sm mt-1">
                    Recent sensitive admin actions. Newest first (last 200).
                </p>
            </header>

            {logs.length === 0 ? (
                <div className="rounded-xl border border-brand-lilac/15 bg-white p-8 text-center text-sm text-brand-dark/50">
                    No audit entries yet. Actions like sign-ins, order status changes and payment
                    confirmations will appear here.
                    <span className="block mt-2 text-brand-dark/40">
                        (Requires migration <code>003_admin_audit.sql</code> to be applied.)
                    </span>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-brand-lilac/15 bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-brand-lilac/15 text-left text-xs uppercase tracking-wide text-brand-dark/40">
                                <th className="px-4 py-3 font-medium">When</th>
                                <th className="px-4 py-3 font-medium">Admin</th>
                                <th className="px-4 py-3 font-medium">Action</th>
                                <th className="px-4 py-3 font-medium">Target</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} className="border-b border-brand-lilac/10 last:border-0">
                                    <td className="px-4 py-3 whitespace-nowrap text-brand-dark/70">{fmt(log.createdAt)}</td>
                                    <td className="px-4 py-3 text-brand-dark/70">{log.adminEmail}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-brand-dark">{ACTION_LABELS[log.action] ?? log.action}</span>
                                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                                            <span className="block text-xs text-brand-dark/40">
                                                {Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(", ")}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-brand-dark/50">
                                        {log.targetType ? `${log.targetType} ${log.targetId ?? ""}`.trim() : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
