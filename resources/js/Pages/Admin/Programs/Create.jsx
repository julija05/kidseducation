import AdminLayout from "@/Layouts/AdminLayout";
import ProgramForm from "./ProgramForm";

export default function Create() {
    const handleSubmit = (data, post, put, options) => {
        post(route("admin.programs.store"), options);
    };

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold mb-6">Create Program</h1>
            <ProgramForm onSubmit={handleSubmit} />
        </AdminLayout>
    );
}
