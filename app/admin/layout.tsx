import AdminSidebar from "@/components/modules/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-neutral-50">
            <AdminSidebar />
            <div className="flex-1 overflow-auto">
                <div className="p-6 lg:p-10">{children}</div>
            </div>
        </div>
    );
}
