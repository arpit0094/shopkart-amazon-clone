// Product Listing Page (Index) - Main landing page
// Features hero banner, category grid, search, filter, and product grid

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import HeroBanner from "@/components/HeroBanner";
import CategoryGrid from "@/components/CategoryGrid";
import Footer from "@/components/Footer";
import { products, categories } from "@/data/products";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const searchQuery = searchParams.get("search") || "";

  // Sync category from URL param if present
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Filter products based on search query and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Deals: products with ≥ 30% discount
  const dealProducts = useMemo(
    () =>
      products
        .filter(
          (p) =>
            p.originalPrice &&
            Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) >= 30
        )
        .slice(0, 6),
    []
  );

  const handleSearch = (query: string) => {
    setSearchParams(query ? { search: query } : {});
    setSelectedCategory("All");
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFiltering = searchQuery || selectedCategory !== "All";

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />

      {/* Hero Banner — only on unfiltered homepage */}
      {!isFiltering && <HeroBanner onCategorySelect={handleCategorySelect} />}

      <main className="container py-4 animate-page-in">
        {/* Category Grid — only on unfiltered homepage */}
        {!isFiltering && (
          <CategoryGrid onCategorySelect={handleCategorySelect} />
        )}

        {/* Deals of the Day section */}
        {!isFiltering && dealProducts.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-bold text-foreground">Deals of the Day</h2>
              <span className="deal-badge text-xs">Limited time</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {dealProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Category filter pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${
                selectedCategory === category
                  ? "bg-amazon-navy text-primary-foreground border-amazon-navy"
                  : "bg-card text-foreground border-border hover:bg-secondary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div className="mb-4">
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              Showing results for "
              <span className="text-amazon-orange font-medium">{searchQuery}</span>
              "
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} result
            {filteredProducts.length !== 1 ? "s" : ""}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Product grid — main listing */}
        {selectedCategory !== "All" || searchQuery ? (
          filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No products found.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filters.
              </p>
            </div>
          )
        ) : (
          /* Full catalogue when no filter active */
          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">All Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
