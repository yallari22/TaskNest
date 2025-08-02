import React from "react";
import dynamic from "next/dynamic";
import ErrorBoundary from "./error-boundary";

// Use dynamic import with SSR disabled for the client component
const HeaderClient = dynamic(() => import("./header-client"), {
  ssr: false,
  loading: () => (
    <header className="container mx-auto">
      <nav className="py-6 px-4 flex justify-between items-center">
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
        </div>
      </nav>
    </header>
  ),
});

export default function Header() {
  return (
    <ErrorBoundary>
      <HeaderClient />
    </ErrorBoundary>
  );
}
