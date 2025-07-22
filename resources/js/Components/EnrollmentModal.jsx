// Components/EnrollmentModal.jsx
export default function EnrollmentModal({ program, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-4 text-center">
                    Confirm Enrollment
                </h2>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <p className="text-center text-gray-700">
                        Do you want to enroll in
                    </p>
                    <p className="text-xl font-bold text-blue-800 text-center mt-2">
                        {program.name}?
                    </p>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{program.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">${program.price}</span>
                    </div>
                </div>

                <p className="text-sm text-gray-500 mb-6 text-center">
                    Your enrollment request will be reviewed by our team. You'll
                    receive an email once approved.
                </p>

                <div className="flex space-x-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Yes, Enroll Me
                    </button>
                </div>
            </div>
        </div>
    );
}
