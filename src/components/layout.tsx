export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <main className="w-full max-w-xl mx-auto p-4">{children}</main>
    </div>
  );
} 