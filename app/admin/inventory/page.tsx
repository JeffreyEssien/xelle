import { getInventoryItems, getInventoryLogs } from "@/lib/queries";
import InventoryContent from "@/components/modules/InventoryContent";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
    const [inventory, logs] = await Promise.all([
        getInventoryItems(),
        getInventoryLogs()
    ]);

    return <InventoryContent inventory={inventory} logs={logs} />;
}
