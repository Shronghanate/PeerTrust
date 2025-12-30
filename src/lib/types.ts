
export type Feedback = {
    id: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    strengths: string;
    areasForImprovement: string;
    timestamp: any; // Firestore timestamp
    visibility: 'public' | 'private' | 'shared';
    reportReason?: string;
};
