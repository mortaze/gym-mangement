"use client";

import React, { useState } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const MetaBox = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-[var(--shadow)] mb-6 overflow-hidden">
      {/* هدر متاباکس */}
      <div
        className="flex justify-between items-center p-3 cursor-pointer border-b border-[var(--border)] select-none"
        onClick={() => setIsOpen(!isOpen)}
        dir="rtl"
      >
        <h3 className="text-[var(--text-body)] text-base font-semibold">{title}</h3>
        <button className="text-[var(--text-dim)] hover:text-[var(--text-body)] transition">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {/* محتوای متاباکس */}
      {isOpen && <div className="p-4 text-sm text-[var(--text-dim)]">{children}</div>}
    </div>
  );
};

export default MetaBox;
