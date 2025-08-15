"use client";

export const Footer = () => {
  return (
    <div className="bg-base-200 border-t border-base-300">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-base-content/70">
          © {new Date().getFullYear()} DefiForge. Built with ❤️ for the DeFi community on Somnia Network.
        </p>
      </div>
    </div>
  );
};

export default Footer;
