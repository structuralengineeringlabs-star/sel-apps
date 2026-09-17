"use client";

import Link from "next/link";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

type Props = {
  activeSlug?: string;
};

export default function CategoryTabs({ activeSlug }: Props) {
  return (
    <div className="bg-white border-b border-gray-200 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 min-w-max py-1">
          <Link
            href="/applications"
            className={cn(
              "px-4 py-3 text-sm font-semibold whitespace-nowrap rounded-t-lg transition-colors",
              !activeSlug
                ? "bg-sel text-white"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            Tout
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/applications?cat=${cat.slug}`}
              className={cn(
                "px-4 py-3 text-sm font-semibold whitespace-nowrap rounded-t-lg transition-colors",
                activeSlug === cat.slug
                  ? "text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              style={
                activeSlug === cat.slug
                  ? { backgroundColor: cat.color }
                  : undefined
              }
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}