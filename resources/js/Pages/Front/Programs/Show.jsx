import React from "react";
import { usePage } from "@inertiajs/react";
import ProgramDetailsSection from "@/Components/ProgramDetailsSection";
import EnrollForm from "@/Components/EnrollForm";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";

export default function ProgramDetail({ auth }) {
    const { program, success } = usePage().props;

    return (
        <GuestFrontLayout auth={auth}>
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <ProgramDetailsSection program={program} />
                <EnrollForm program={program} success={success} />
            </div>
        </GuestFrontLayout>
    );
}
