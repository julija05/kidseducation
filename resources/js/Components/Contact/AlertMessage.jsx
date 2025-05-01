export default function AlertMessage({ type = "success", message }) {
    if (!message) return null;

    const bgColor =
        type === "error"
            ? "bg-red-100 text-red-800"
            : "bg-green-100 text-green-800";

    return <div className={`mb-6 p-4 rounded ${bgColor}`}>{message}</div>;
}
