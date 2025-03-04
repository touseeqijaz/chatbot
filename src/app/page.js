import Image from "next/image";
import ChatInterface from "./components/ChatInterface";
export default function Home() {
  return (
    <div className="min-h-screen bg-[#000000] p-8">
      <ChatInterface />
    </div>
  );
}
