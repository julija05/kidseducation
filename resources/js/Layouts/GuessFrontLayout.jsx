import React from "react";
import NavBar from "@/Components/NavBar";
import { Footer } from "@/Components/Footer";
import ChatWidget from "@/Components/Chat/ChatWidget";
import GlobalChatToast from "@/Components/Chat/GlobalChatToast";
import { ChatProvider } from "@/Contexts/ChatContext";

export default function GuestFrontLayout({ children, auth }) {
    return (
        <ChatProvider>
            <div className="flex flex-col min-h-screen bg-gray-100">
                <NavBar auth={auth} />

                {/* Main Content - hero section fills the remaining space */}
                <div className="flex-grow flex items-center justify-center relative">
                    <main className="w-full">{children}</main>
                </div>

                {/* Footer */}
                <Footer />
                
                {/* Live Chat Widget */}
                <ChatWidget />
                
                {/* Global Chat Toast */}
                <GlobalChatToast />
            </div>
        </ChatProvider>
    );
}
