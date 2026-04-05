export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
