// Single Responsibility: Handle form submission logic
export class FormSubmitHandler {
    constructor(post, route) {
        this.post = post;
        this.route = route;
    }

    // Open/Closed Principle: Easy to extend for different submission strategies
    prepareData(data, isUpdate = false) {
        const cleanData = { ...data };

        // For updates: only include image if a new file was selected
        if (isUpdate && !data.image) {
            delete cleanData.image;
        }

        return cleanData;
    }

    getSubmissionOptions() {
        return {
            forceFormData: true,
            preserveScroll: true,
            preserveState: false,
        };
    }

    handleCreate(data, onSuccess, onError) {
        const cleanData = this.prepareData(data, false);

        this.post(this.route("admin.programs.store"), cleanData, {
            ...this.getSubmissionOptions(),
            onSuccess,
            onError,
        });
    }

    handleUpdate(data, programId, onSuccess, onError) {
        const cleanData = this.prepareData(data, true);

        this.post(this.route("admin.programs.update", programId), cleanData, {
            ...this.getSubmissionOptions(),
            onSuccess,
            onError,
        });
    }
}
