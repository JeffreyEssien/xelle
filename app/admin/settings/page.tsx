import SiteSettingsForm from "@/components/modules/SiteSettingsForm";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-2xl text-brand-dark">Site Settings</h1>
                <p className="text-brand-dark/60 text-sm">Manage global site configuration.</p>
            </div>

            <div className="bg-white rounded-lg border border-brand-lilac/20 p-6">
                <SiteSettingsForm />
            </div>
        </div>
    );
}
