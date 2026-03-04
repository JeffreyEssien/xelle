import { getDeliveryZones } from "@/lib/queries";
import DeliveryManagement from "@/components/modules/DeliveryManagement";

export const dynamic = "force-dynamic";

export default async function AdminDeliveryPage() {
    const zones = await getDeliveryZones();
    return <DeliveryManagement initialZones={zones} />;
}
