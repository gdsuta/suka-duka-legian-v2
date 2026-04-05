export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Control panel skeleton */}
        <div className="h-16 bg-white rounded-lg shadow-md animate-pulse" />

        {/* Header skeleton */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse shrink-0" />
          <div className="space-y-3 flex-1">
            <div className="h-8 w-72 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Saldo skeleton */}
        <div className="bg-white p-8 rounded-lg shadow-md text-center border-t-4 border-indigo-200">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mx-auto mb-4" />
          <div className="h-14 w-72 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-9 w-36 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="h-6 w-52 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-64 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
