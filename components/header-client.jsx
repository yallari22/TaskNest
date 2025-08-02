"use client";

import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import UserMenu from "./user-menu";
import { PenBox } from "lucide-react";
import Image from "next/image";
import UserLoading from "./user-loading";
import { ThemeToggle } from "./theme-toggle";
import NotificationBellClient from "./notifications/notification-bell-client";

export default function HeaderClient() {
  return (
    <header className="container mx-auto">
      <nav className="py-6 px-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Image
                  src={"/task-nest-icon.svg"}
                  alt="Task Nest Icon"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain animate-float hover:animate-pulse"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-green-300 to-teal-400 opacity-20 rounded-full animate-color-shift"></div>
              </div>
              <span className="text-xl font-bold">Task Nest</span>
            </div>
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/project/create">
            <Button variant="destructive" className="flex items-center gap-2">
              <PenBox size={18} />
              <span className="hidden md:inline">Create Project</span>
            </Button>
          </Link>
          <ThemeToggle />
          <SignedOut>
            <SignInButton forceRedirectUrl="/onboarding">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <NotificationBellClient />
            <UserMenu />
          </SignedIn>
        </div>
      </nav>

      <UserLoading />
    </header>
  );
}
