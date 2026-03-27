// Header Component - Amazon-style navigation bar
// Includes logo, search bar, wishlist, cart icon, and category navigation

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, MapPin, Menu, User, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { categories } from "@/data/products";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string;
}

const Header = ({ onSearch, onCategorySelect, selectedCategory }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { getCartItemCount, wishlistItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const cartCount = getCartItemCount();

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main header bar */}
      <div className="bg-amazon-navy px-2 sm:px-4 py-2 flex items-center gap-2 sm:gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-1 px-2 py-1 border border-transparent hover:border-primary-foreground rounded transition-colors shrink-0"
        >
          <span className="text-primary-foreground text-xl sm:text-2xl font-bold tracking-tight">
            shop<span className="text-amazon-orange">kart</span>
          </span>
        </Link>

        {/* Deliver to section - hidden on small screens */}
        <div className="hidden lg:flex items-center gap-1 text-primary-foreground px-2 py-1 border border-transparent hover:border-primary-foreground rounded cursor-pointer transition-colors">
          <MapPin size={18} className="text-primary-foreground/70" />
          <div className="text-xs leading-tight">
            <span className="text-primary-foreground/70">Deliver to</span>
            <div className="font-bold text-sm">India</div>
          </div>
        </div>

        {/* Search bar - full width */}
        <form onSubmit={handleSearch} className="flex-1 flex">
          <div className="flex w-full rounded-md overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands and more..."
              className="flex-1 px-3 py-2 text-sm text-foreground bg-card outline-none min-w-0"
            />
            <button
              type="submit"
              className="bg-amazon-search-btn hover:bg-amazon-orange px-3 sm:px-4 transition-colors"
            >
              <Search size={20} className="text-amazon-navy" />
            </button>
          </div>
        </form>

        {/* Account link */}
        <Link
          to="/login"
          className="hidden sm:flex items-center gap-1 text-primary-foreground px-2 py-1 border border-transparent hover:border-primary-foreground rounded transition-colors"
        >
          <User size={18} />
          <div className="text-xs leading-tight">
            <span className="text-primary-foreground/70">Hello, {user?.name?.split(" ")[0] ?? "Sign in"}</span>
            <div className="font-bold text-sm">Account</div>
          </div>
        </Link>

        {/* Wishlist icon */}
        <Link
          to="/wishlist"
          className="hidden sm:flex items-center gap-1 text-primary-foreground px-2 py-1 border border-transparent hover:border-primary-foreground rounded transition-colors relative"
        >
          <div className="relative">
            <Heart size={24} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-amazon-orange text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </div>
          <span className="hidden lg:inline font-bold text-sm">Wishlist</span>
        </Link>

        {/* Cart icon with item count badge */}
        <Link
          to="/cart"
          className="flex items-center gap-1 text-primary-foreground px-2 py-1 border border-transparent hover:border-primary-foreground rounded transition-colors relative"
        >
          <div className="relative">
            <ShoppingCart size={28} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amazon-orange text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="hidden sm:inline font-bold text-sm">Cart</span>
        </Link>
      </div>

      {/* Bottom navigation bar with categories */}
      <div className="bg-amazon-header-bottom px-2 sm:px-4 py-1.5 flex items-center gap-1 overflow-x-auto scrollbar-hide text-primary-foreground text-sm">
        <button className="flex items-center gap-1 px-2 py-1 hover:border hover:border-primary-foreground rounded transition-colors whitespace-nowrap font-bold">
          <Menu size={18} />
          <span className="hidden sm:inline">All</span>
        </button>
        {categories
          .filter((c) => c !== "All")
          .map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect?.(category)}
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap text-sm ${
                selectedCategory === category
                  ? "border border-primary-foreground font-semibold"
                  : "hover:border hover:border-primary-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        <Link
          to="/orders"
          className="px-2 py-1 hover:border hover:border-primary-foreground rounded transition-colors whitespace-nowrap sm:hidden"
        >
          Orders
        </Link>
        <Link
          to="/wishlist"
          className="px-2 py-1 hover:border hover:border-primary-foreground rounded transition-colors whitespace-nowrap sm:hidden"
        >
          Wishlist
        </Link>
      </div>
    </header>
  );
};

export default Header;
