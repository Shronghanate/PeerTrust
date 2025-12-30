

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

export type UserProfile = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    photoURL: string;
    feedbackVisibility: 'private' | 'managers' | 'all';
};

export type FeedbackRequest = {
    id:string;
    requesterId: string;
    requesteeId: string;
    status: 'pending' | 'completed' | 'declined';
    timestamp: any; // Firestore timestamp
}

export type Interaction = {
    id: string;
    participant1Id: string;
    participant2Id: string;
    timestamp: any; // Firestore timestamp
};

export type PendingInteraction = {
    id: string;
    requesterId: string;
    requesteeId: string;
    status: 'pending' | 'confirmed' | 'declined';
    timestamp: any; // Firestore timestamp
}