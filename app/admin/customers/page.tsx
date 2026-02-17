import { getCustomers } from "@/lib/queries";
import CustomersContent from "@/components/modules/CustomersContent";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
    const customers = await getCustomers();
    return <CustomersContent customers={customers} />;
}
