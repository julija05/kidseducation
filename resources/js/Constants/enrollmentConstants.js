export const ENROLLMENT_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    PAUSED: 'paused',
    CANCELLED: 'cancelled',
};

export const APPROVAL_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};

export const ENROLLMENT_TYPE = {
    STUDENT: 'student',
    MENTOR: 'mentor',
};

export const RESOURCE_TYPE = {
    VIDEO: 'video',
    DOCUMENT: 'document',
    LINK: 'link',
    DOWNLOAD: 'download',
    INTERACTIVE: 'interactive',
    QUIZ: 'quiz',
};

export const RESOURCE_TYPE_LABELS = {
    [RESOURCE_TYPE.VIDEO]: 'Video',
    [RESOURCE_TYPE.DOCUMENT]: 'Document',
    [RESOURCE_TYPE.LINK]: 'External Link',
    [RESOURCE_TYPE.DOWNLOAD]: 'Download',
    [RESOURCE_TYPE.INTERACTIVE]: 'Interactive Content',
    [RESOURCE_TYPE.QUIZ]: 'Quiz',
};

export const LESSON_PROGRESS_STATUS = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
};
