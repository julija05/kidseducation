// Single Responsibility: Display image preview with proper URL handling
export default function ImagePreview({ imagePath, alt = "Current image" }) {
    if (!imagePath) {
        return null;
    }

    const getImageUrl = (path) => {
        if (path.startsWith("/storage/")) {
            return path;
        }
        return `/storage/${path}`;
    };

    return (
        <div className="mb-2">
            <img
                src={getImageUrl(imagePath)}
                alt={alt}
                className="w-32 h-auto rounded"
            />
            <p className="text-sm text-gray-600">{alt}</p>
        </div>
    );
}
