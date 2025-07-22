import AdminLayout from "@/Layouts/AdminLayout";
import ProgramForm from "./ProgramForm";

export default function Edit({ program }) {
    const handleSubmit = (data, post, put, options) => {
        // Use post method with method spoofing for form data uploads
        post(route("admin.programs.update", program.slug || program.id), data, {
            ...options,
            onSuccess: () => {
                console.log("Update successful");
            },
            onError: (errors) => {
                console.log("Update errors:", errors);
            },
        });
    };

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold mb-6">Edit Program</h1>
            <ProgramForm formData={program} onSubmit={handleSubmit} />
        </AdminLayout>
    );
}
