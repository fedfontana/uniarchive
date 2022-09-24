import Link from "next/link";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="w-full min-h-[100vh]
            bg-white text-neutral-900 
            dark:bg-neutral-900 dark:text-white 
            transition-colors duration-500 
            font-sourcecodepro
            "
    >
      <div className="mb-5 md:mb-4 bg-green-300">
        <Navbar />
      </div>
      <main className="relative w-8/12 mx-auto">{children}</main>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="bg-neutral-300 dark:bg-neutral-800 py-6 w-full px-32 flex flex-row justify-between items-baseline transition-colors duration-500 ">
      <h1 className="text-3xl hover:underline">
        <Link href="/">uniarchive</Link>
      </h1>
      <button className="text-xl underline cursor-pointer" onClick={switchTheme}>switch theme</button>
    </nav>
  );
}

function switchTheme() {
  if(!document) return;
  if(document.querySelector("html")?.classList.contains("dark")) {
    document.querySelector("html")?.classList.remove("dark");
    return;
  }
  document.querySelector("html")?.classList.add("dark");
}
