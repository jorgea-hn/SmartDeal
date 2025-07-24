export default function LoadingSpinner({ message = "Cargando productos..." }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl shadow-inner border border-dashed border-blue-300 animate-pulse">
      <svg
        className="animate-spin h-10 w-10 text-blue-500 mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        ></path>
      </svg>
      <p className="text-blue-700 font-medium text-lg">{message}</p>
    </div>
  );
}
