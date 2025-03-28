export interface CardType {
    id: string;
    title: string;
    tags: string[];
    content: string;
    created_at: number;
    updated_at: number;
}

export const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
};
