import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import "react-day-picker/dist/style.css";
import { ToasterProvider } from "@/components/toaster-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Task Nest | Modern Project Management",
  description: "Streamline your workflow with Task Nest, the modern project management tool for teams of all sizes.",
  keywords: "project management, task management, agile, scrum, kanban, team collaboration",
  authors: [{ name: "Task Nest Team" }],
  creator: "Task Nest",
  publisher: "Task Nest",
  icons: {
    icon: "/task-nest-icon.svg",
    apple: "/task-nest-icon.svg",
  },
};
// Import ErrorBoundary dynamically to avoid SSR issues
import dynamic from "next/dynamic";

const ErrorBoundaryClient = dynamic(() => import("@/components/error-boundary"), {
  ssr: false,
});

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: shadesOfPurple,
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#1a202c",
          colorInputBackground: "#2D3748",
          colorInputText: "#F3F4F6",
        },
        elements: {
          formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white",
          card: "bg-gray-800",
          headerTitle: "text-blue-400",
          headerSubtitle: "text-gray-400",
        },
      }}
    >
      <html lang="en">
        <body className={`${inter.className} animated-dotted-background`}>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {/* The Header component already has its own ErrorBoundary */}
            <Header />
            <main className="min-h-screen">
              <ErrorBoundaryClient>
                {children}
              </ErrorBoundaryClient>
            </main>
            <ToasterProvider />
            <footer className="bg-gray-900 py-12">
              <div className="container mx-auto px-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="relative">
                    <img src="/task-nest-icon.svg" alt="Task Nest Icon" className="h-8 w-8 object-contain animate-float" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-green-300 to-teal-400 opacity-20 rounded-full animate-color-shift"></div>
                  </div>
                  <span className="text-xl font-bold text-white">Task Nest</span>
                </div>
                <p className="text-gray-200">© {new Date().getFullYear()} Task Nest. All rights reserved.</p>
                <div className="mt-4 flex justify-center space-x-6">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact Us
                  </a>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}