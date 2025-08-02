"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [isFirstMount, setIsFirstMount] = useState(true);

  useEffect(() => {
    setIsFirstMount(false);
  }, []);

  return (
    <motion.div
      key={pathname}
      initial={{ 
        opacity: 0,
        y: isFirstMount ? 0 : 20 
      }}
      animate={{ 
        opacity: 1,
        y: 0 
      }}
      exit={{ 
        opacity: 0,
        y: 20 
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.3
      }}
    >
      {children}
    </motion.div>
  );
}
