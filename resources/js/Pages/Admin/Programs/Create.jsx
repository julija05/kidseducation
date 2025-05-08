import AdminLayout from "@/Layouts/AdminLayout";
import ProgramForm from "./ProgramForm";
import { router } from "@inertiajs/react";

export default function Create() {
    const handleSubmit = (data, post) => {
        post(route("admin.programs.store"));
    };

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold mb-6">Create Program</h1>
            <ProgramForm onSubmit={handleSubmit} />
        </AdminLayout>
    );
}
