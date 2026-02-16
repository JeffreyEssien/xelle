import AdminSidebar from "@/components/modules/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-neutral-50">
            <AdminSidebar />
            <div className="flex-1 overflow-auto pt-14 lg:pt-0">
                <div className="p-4 sm:p-6 lg:p-10">{children}</div>
            </div>
        </div>
    );
}
