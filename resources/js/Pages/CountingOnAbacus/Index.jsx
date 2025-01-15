import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Index() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Counting On Abacus
                </h2>
            }
        ></AuthenticatedLayout>
    );
}
