import GroupDashboard from "@/Components/LearningGroups/GroupDashboard";
import MentorLayout from "@/Layouts/MentorLayout";
import { Head } from "@inertiajs/react";

export default function Show({ group, homeworkOptions }) {
    return (
        <MentorLayout>
            <Head title={`${group.name} Dashboard`} />
            <GroupDashboard
                group={group}
                homeworkOptions={homeworkOptions}
                backHref={route("mentor.learning-groups.index")}
                backLabel="My Groups"
                theme="mentor"
            />
        </MentorLayout>
    );
}
