"use client";

import { useState, useEffect } from "react";

const roles = [
  "Backend Engineers",
  "Marketing Designers",
  "Product Managers",
  "Data Scientists",
  "DevOps Engineers",
  "UX Designers",
];

export default function TypeWriter() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = roles[index];

    const timer = setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, text.length + 1));
        if (text.length === current.length) {
          setTimeout(() => setDeleting(true), 2000);
        }
      } else {
        setText(current.slice(0, text.length - 1));
        if (text.length === 0) {
          setDeleting(false);
          setIndex((i) => (i + 1) % roles.length);
        }
      }
    }, deleting ? 30 : 80);

    return () => clearTimeout(timer);
  }, [text, deleting, index]);

  return (
    <span className="bg-gradient-to-r from-[#2EC4B6] to-[#4FA3D1] bg-clip-text text-transparent">
      {text}
      <span className="animate-pulse text-[#2EC4B6]">|</span>
    </span>
  );
}
