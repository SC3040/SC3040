import Image from "next/image";

export default function Home() {
  return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
          <p>Home</p>
          <code className="bg-gray-200 p-2 rounded">
              {process.env.NEXT_PUBLIC_RUNTIME_BACKEND_URL || 'Not set'}
          </code>
      </main>
  );
}
