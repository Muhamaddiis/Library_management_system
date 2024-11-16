import Image from "next/image";
import Sidebar from "./Components/Sidebar/sidebar";
import Dashboard from "./Components/Dashboard/Dashboard";
export default function Home() {
  return (
    <main className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
      <Sidebar />
      <Dashboard />
    </main>
  );
}
