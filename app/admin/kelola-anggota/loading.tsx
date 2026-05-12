export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-52 bg-gray-200 rounded animate-pulse" />
        <div className="h-16 bg-white rounded-lg shadow-sm animate-pulse" />
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}