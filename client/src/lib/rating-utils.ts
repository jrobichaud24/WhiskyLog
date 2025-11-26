export const RATING_LABELS: Record<number, string> = {
    1: "Poor/Undrinkable",
    2: "Poor/Undrinkable",
    3: "Below Average",
    4: "Below Average",
    5: "Good/Average",
    6: "Good/Average",
    7: "Great/Excellent",
    8: "Great/Excellent",
    9: "Exceptional/Perfection",
    10: "Exceptional/Perfection",
};

export const getRatingLabel = (rating: number): string => {
    if (rating < 1) return "Not Rated";
    return RATING_LABELS[Math.round(rating)] || "Unknown";
};

export const getRatingColor = (rating: number): string => {
    if (rating >= 9) return "text-amber-600";
    if (rating >= 7) return "text-amber-500";
    if (rating >= 5) return "text-amber-400";
    if (rating >= 3) return "text-amber-300";
    return "text-slate-400";
};
