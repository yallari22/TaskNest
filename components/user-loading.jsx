"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import React from "react";
import { AdvancedLoader } from "@/components/loaders";

const UserLoading = () => {
  const { isLoaded } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();

  if (!isLoaded || !isUserLoaded) {
    return (
      <div className="mb-4 flex justify-center">
        <AdvancedLoader
          variant="spinner"
          type="hash"
          color="#36d7b7"
          size={30}
          text="Loading user data..."
          textPosition="bottom"
        />
      </div>
    );
  }

  return null;
};

export default UserLoading;
