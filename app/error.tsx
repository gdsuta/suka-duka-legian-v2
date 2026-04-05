"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white p-10 rounded-lg shadow-md max-w-md w-full mx-4">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Terjadi Kesalahan
        </h2>
        <p className="text-gray-500 mb-6 text-sm">{error.message}</p>
        <button
          onClick={reset}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Coba Lagi
        </button>
        <div className="mt-4">
          <a href="/" className="text-blue-500 hover:underline text-sm">
            ← Kembali ke Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
