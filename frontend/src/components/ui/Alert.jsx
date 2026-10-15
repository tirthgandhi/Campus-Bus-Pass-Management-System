export default function Alert({ type = "error", message }) {
  if (!message) return null;

  const styles =
    type === "success"
      ? "bg-green-100 text-green-800 border-green-300"
      : "bg-red-100 text-red-800 border-red-300";

  return (
    <div className={`border rounded-lg px-4 py-3 text-sm mb-4 ${styles}`}>
      {message}
    </div>
  );
}