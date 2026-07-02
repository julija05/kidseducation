import GroupDashboard from "@/Components/LearningGroups/GroupDashboard";
import MentorLayout from "@/Layouts/MentorLayout";
import { Head } from "@inertiajs/react";

export default function Show({ group, homeworkOptions, attendanceOptions }) {
    return (
        <MentorLayout>
            <Head title={`${group.name} Dashboard`} />
            <div className="-mx-4 -my-6 min-h-screen bg-slate-50 px-4 py-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="mx-auto max-w-[1500px]">
                    <GroupDashboard
                        group={group}
                        homeworkOptions={homeworkOptions}
                        attendanceOptions={attendanceOptions}
                        backHref={route("mentor.learning-groups.index")}
                        backLabel="My Groups"
                        theme="mentor"
                    />
                </div>
            </div>
        </MentorLayout>
    );
}
