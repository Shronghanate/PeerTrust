export const mockFeedbackData = {
  ratings: [5, 4, 5, 5, 3, 4, 5, 5, 2],
  strengths: [
    "Excellent communication skills.",
    "Great team player and always willing to help.",
    "Very knowledgeable in their domain.",
    "Proactive and takes initiative.",
    "Code quality is consistently high.",
  ],
  improvementAreas: [
    "Could be more vocal in team meetings.",
    "Time management on larger tasks could be better.",
    "Sometimes hesitates to ask for help.",
  ],
};

export const ratingsDistribution = [
  { name: '1 Star', total: 0 },
  { name: '2 Stars', total: 1 },
  { name: '3 Stars', total: 1 },
  { name: '4 Stars', total: 2 },
  { name: '5 Stars', total: 5 },
];

export const feedbackRequests = {
    incoming: [
      { id: 1, name: "Alice Johnson", role: "Product Manager", avatarId: "alice-avatar-40", date: "2 days ago" },
      { id: 2, name: "Bob Williams", role: "UX Designer", avatarId: "bob-avatar-40", date: "5 days ago" },
    ],
    sent: [
      { id: 3, name: "Charlie Brown", role: "Backend Engineer", avatarId: "charlie-avatar-40", date: "1 day ago", status: "Pending" },
      { id: 4, name: "Diana Prince", role: "QA Engineer", avatarId: "diana-avatar-40", date: "1 week ago", status: "Completed" },
    ],
  };
