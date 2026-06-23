import GroupDashboard from "@/Components/LearningGroups/GroupDashboard";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";

export default function Show({ group }) {
    return (
        <AdminLayout>
            <Head title={`${group.name} Dashboard`} />
            <GroupDashboard
                group={group}
                backHref={route("admin.learning-groups.index")}
                backLabel="Learning Groups"
                theme="admin"
            />
        </AdminLayout>
    );
}
