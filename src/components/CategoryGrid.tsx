// CategoryGrid Component - "Shop by Category" tiles for homepage
// Matches Amazon's category browsing pattern

import { categories } from "@/data/products";

const categoryMeta: Record<string, { emoji: string; gradient: string }> = {
  Electronics: { emoji: "📱", gradient: "from-blue-900 to-blue-700" },
  Books: { emoji: "📚", gradient: "from-amber-900 to-amber-700" },
  Clothing: { emoji: "👗", gradient: "from-purple-900 to-purple-700" },
  "Home & Kitchen": { emoji: "🏠", gradient: "from-green-900 to-green-700" },
  "Sports & Outdoors": { emoji: "🏋️", gradient: "from-orange-900 to-orange-700" },
  "Toys & Games": { emoji: "🎮", gradient: "from-red-900 to-red-700" },
  Beauty: { emoji: "✨", gradient: "from-pink-900 to-pink-700" },
  Grocery: { emoji: "🛒", gradient: "from-teal-900 to-teal-700" },
};

interface CategoryGridProps {
  onCategorySelect: (category: string) => void;
}

const CategoryGrid = ({ onCategorySelect }: CategoryGridProps) => {
  const displayCategories = categories.filter((c) => c !== "All");

  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold text-foreground mb-3">Shop by Category</h2>
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
        {displayCategories.map((cat) => {
          const meta = categoryMeta[cat] ?? { emoji: "🛍️", gradient: "from-gray-700 to-gray-600" };
          return (
            <button
              key={cat}
              onClick={() => onCategorySelect(cat)}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-amazon-orange hover:shadow-md transition-all duration-200"
            >
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200`}
              >
                {meta.emoji}
              </div>
              <span className="text-xs text-center font-medium text-foreground leading-tight">
                {cat}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGrid;
