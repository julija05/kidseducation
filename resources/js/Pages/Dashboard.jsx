import Card from "@/Components/Card";
import SideNavigation from "@/Components/SideNavigation";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Circle } from "react-awesome-shapes/dist/shapes/circle";

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Introduction
                </h2>
            }
        >
            <Head title="Introduction" />

            <div className="container px-6 m-auto pt-6">
                <h1 className="text-xl font-semibold leading-tight text-gray-800">
                    General Facts
                </h1>
                <div className="grid grid-cols-4 gap-6 md:grid-cols-8 lg:grid-cols-12 pt-6">
                    <div className="col-span-4">
                        <Card
                            title="Something to remember"
                            content="All components can be copied and pasted and easily implemented in your Tailwind CSS projects. You can choose which language you want to copy the desired component and just hover and click on the component you need and paste it into your project."
                        />
                    </div>
                    <div className="col-span-4">
                        <Card
                            title="Something to remember"
                            content="All components can be copied and pasted and easily implemented in your Tailwind CSS projects. You can choose which language you want to copy the desired component and just hover and click on the component you need and paste it into your project."
                        />
                    </div>
                    <div className="col-span-4">
                        <Card
                            title="Something to remember"
                            content="All components can be copied and pasted and easily implemented in your Tailwind CSS projects. You can choose which language you want to copy the desired component and just hover and click on the component you need and paste it into your project."
                        />
                    </div>
                </div>
            </div>

            <section>
                <div class="container px-6 m-auto pt-6">
                    <h1 className="text-xl font-semibold leading-tight text-gray-800">
                        Course Structure
                    </h1>
                    <div class="grid grid-cols-4 gap-6 md:grid-cols-8 lg:grid-cols-12 pt-6">
                        <div class="col-span-4 lg:col-span-2 ">
                            <div className="relative w-[180px] h-[180px]">
                                {/* Circle */}
                                <div
                                    className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-300 to-indigo-600"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #a5b4fc, #6366f1)",
                                    }}
                                ></div>

                                {/* Text */}
                                <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                    Step 1
                                </div>
                            </div>
                        </div>
                        <div class="col-span-4 lg:col-span-2">
                            {" "}
                            <div className="relative w-[180px] h-[180px]">
                                {/* Circle */}
                                <div
                                    className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-300 to-indigo-600"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #a5b4fc, #6366f1)",
                                    }}
                                ></div>

                                {/* Text */}
                                <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                    Step 2
                                </div>
                            </div>
                        </div>
                        <div class="col-span-4 lg:col-span-2">
                            {" "}
                            <div className="relative w-[180px] h-[180px]">
                                {/* Circle */}
                                <div
                                    className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-300 to-indigo-600"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #a5b4fc, #6366f1)",
                                    }}
                                ></div>

                                {/* Text */}
                                <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                    Step 3
                                </div>
                            </div>
                        </div>
                        <div class="col-span-4 lg:col-span-2">
                            {" "}
                            <div className="relative w-[180px] h-[180px]">
                                {/* Circle */}
                                <div
                                    className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-300 to-indigo-600"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #a5b4fc, #6366f1)",
                                    }}
                                ></div>

                                {/* Text */}
                                <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                    Step 4
                                </div>
                            </div>
                        </div>
                        <div class="col-span-4 lg:col-span-2">
                            {" "}
                            <div className="relative w-[180px] h-[180px]">
                                {/* Circle */}
                                <div
                                    className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-300 to-indigo-600"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #a5b4fc, #6366f1)",
                                    }}
                                ></div>

                                {/* Text */}
                                <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                    Step 5
                                </div>
                            </div>
                        </div>
                        <div class="col-span-4 lg:col-span-2">
                            {" "}
                            <div className="relative w-[180px] h-[180px]">
                                {/* Circle */}
                                <div
                                    className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-300 to-indigo-600"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #a5b4fc, #6366f1)",
                                    }}
                                ></div>

                                {/* Text */}
                                <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                    Step 6
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
