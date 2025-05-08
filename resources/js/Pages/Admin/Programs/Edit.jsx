import AdminLayout from "@/Layouts/AdminLayout";
import ProgramForm from "./ProgramForm";
import { router } from "@inertiajs/react";

export default function Edit({ program }) {
    const handleSubmit = (data, _, put) => {
        put(route("admin.programs.update", program.id));
    };

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold mb-6">Edit Program</h1>
            <ProgramForm formData={program} onSubmit={handleSubmit} />
        </AdminLayout>
    );
}
