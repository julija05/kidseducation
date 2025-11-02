/**
 * Proposal Constants
 * Frontend constants for mentor proposals matching backend constants
 */

// Proposal Types
export const PROPOSAL_TYPE = {
    RESOURCE_CREATE: 'resource_create',
    RESOURCE_UPDATE: 'resource_update',
    RESOURCE_DELETE: 'resource_delete',
    LESSON_CREATE: 'lesson_create',
    LESSON_UPDATE: 'lesson_update',
    LESSON_DELETE: 'lesson_delete',
    LEVEL_CREATE: 'level_create',
    LEVEL_UPDATE: 'level_update',
};

// Proposal Statuses
export const PROPOSAL_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    APPLIED: 'applied',
};

// Status Labels
export const PROPOSAL_STATUS_LABELS = {
    [PROPOSAL_STATUS.PENDING]: 'Pending Review',
    [PROPOSAL_STATUS.APPROVED]: 'Approved',
    [PROPOSAL_STATUS.REJECTED]: 'Rejected',
    [PROPOSAL_STATUS.APPLIED]: 'Applied',
};

// Status Colors (Tailwind CSS classes)
export const PROPOSAL_STATUS_COLORS = {
    [PROPOSAL_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    [PROPOSAL_STATUS.APPROVED]: 'bg-green-100 text-green-800 border-green-300',
    [PROPOSAL_STATUS.REJECTED]: 'bg-red-100 text-red-800 border-red-300',
    [PROPOSAL_STATUS.APPLIED]: 'bg-blue-100 text-blue-800 border-blue-300',
};

// Type Labels
export const PROPOSAL_TYPE_LABELS = {
    [PROPOSAL_TYPE.RESOURCE_CREATE]: 'Add New Resource',
    [PROPOSAL_TYPE.RESOURCE_UPDATE]: 'Update Resource',
    [PROPOSAL_TYPE.RESOURCE_DELETE]: 'Delete Resource',
    [PROPOSAL_TYPE.LESSON_CREATE]: 'Add New Lesson',
    [PROPOSAL_TYPE.LESSON_UPDATE]: 'Update Lesson',
    [PROPOSAL_TYPE.LESSON_DELETE]: 'Delete Lesson',
    [PROPOSAL_TYPE.LEVEL_CREATE]: 'Add New Level',
    [PROPOSAL_TYPE.LEVEL_UPDATE]: 'Update Level',
};
