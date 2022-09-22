import Link from "next/link";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="w-full min-h-full 
            bg-white text-neutral-900 
            dark:bg-neutral-900 dark:text-white 
            transition-colors duration-500 
            font-sourcecodepro"
    >
      <div className="mb-5 md:mb-4">
        <Navbar />
      </div>
      <main className="relative w-8/12 mx-auto">{children}</main>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="bg-neutral-300 py-6 w-full px-32 flex flex-row justify-between items-baseline">
      <h1 className="text-3xl">
        <Link href="/">uniarchive</Link>
      </h1>
      <button className="text-xl underline cursor-pointer">use dark theme</button>
    </nav>
  );
}
