import AdminLayout from "@/Layouts/AdminLayout";
import ProgramForm from "./ProgramForm";

export default function Edit({ program }) {
    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold mb-6">Edit Program</h1>
            <ProgramForm formData={program} />
        </AdminLayout>
    );
}
