// Footer Component - Reusable Amazon-style footer
// Used on all pages for consistent layout

import { Link } from "react-router-dom";

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-amazon-navy text-primary-foreground mt-12">
      {/* Back to top bar */}
      <div
        onClick={scrollToTop}
        className="bg-amazon-header-bottom text-center py-3 cursor-pointer hover:bg-[hsl(195,30%,28%)] transition-colors"
      >
        <span className="text-sm">Back to top</span>
      </div>

      {/* Links grid */}
      <div className="container py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <h4 className="font-bold mb-3">Get to Know Us</h4>
          <ul className="space-y-2 text-primary-foreground/70">
            <li className="hover:text-primary-foreground hover:underline cursor-pointer transition-colors">About Us</li>
            <li className="hover:text-primary-foreground hover:underline cursor-pointer transition-colors">Careers</li>
            <li className="hover:text-primary-foreground hover:underline cursor-pointer transition-colors">Press Releases</li>
            <li className="hover:text-primary-foreground hover:underline cursor-pointer transition-colors">ShopKart Science</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">Connect with Us</h4>
          <ul className="space-y-2 text-primary-foreground/70">
            <li className="hover:text-primary-foreground hover:underline cursor-pointer transition-colors">Facebook</li>
            <li className="hover:text-primary-foreground hover:underline cursor-pointer transition-colors">Twitter / X</li>
            <li className="hover:text-primary-foreground hover:underline cursor-pointer transition-colors">Instagram</li>
            <li className="hover:text-primary-foreground hover:underline cursor-pointer transition-colors">YouTube</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">Make Money with Us</h4>
          <ul className="space-y-2 text-primary-foreground/70">
            <li className="hover:text-primary-foreground hover:underline cursor-pointer transition-colors">Sell on ShopKart</li>
            <li className="hover:text-primary-foreground hover:underline cursor-pointer transition-colors">Become an Affiliate</li>
            <li className="hover:text-primary-foreground hover:underline cursor-pointer transition-colors">Advertise Your Products</li>
            <li className="hover:text-primary-foreground hover:underline cursor-pointer transition-colors">Self-Publish with Us</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">Let Us Help You</h4>
          <ul className="space-y-2 text-primary-foreground/70">
            <li>
              <Link to="/orders" className="hover:text-primary-foreground hover:underline transition-colors">
                Your Account
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-primary-foreground hover:underline transition-colors">
                Your Orders
              </Link>
            </li>
            <li className="hover:text-primary-foreground hover:underline cursor-pointer transition-colors">Returns Centre</li>
            <li className="hover:text-primary-foreground hover:underline cursor-pointer transition-colors">Help</li>
          </ul>
        </div>
      </div>

      {/* Brand + copyright */}
      <div className="border-t border-primary-foreground/20 py-6 flex flex-col items-center gap-2">
        <span className="text-xl font-bold tracking-tight">
          shop<span className="text-amazon-orange">kart</span>
        </span>
        <p className="text-xs text-primary-foreground/50 text-center">
          © 2026 ShopKart, Inc. or its affiliates. All rights reserved.
          <br />
          Amazon Clone — SDE Intern Assignment
        </p>
      </div>
    </footer>
  );
};

export default Footer;
