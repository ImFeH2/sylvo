import { invoke } from '@tauri-apps/api/core';
import { CardType } from '@types';

/**
 * API namespace containing all card-related operations
 */
export namespace CardAPI {
    /**
     * Fetch all cards from the repository
     */
    export async function getAllCards(): Promise<CardType[]> {
        try {
            return await invoke<CardType[]>('get_all_cards');
        } catch (error) {
            console.error('Failed to fetch cards:', error);
            throw error;
        }
    }

    /**
     * Fetch a single card by ID
     */
    export async function getCard(id: string): Promise<CardType | null> {
        try {
            const card = await invoke<CardType | null>('get_card', { id });
            return card;
        } catch (error) {
            console.error(`Failed to fetch card with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Add a new card to the repository
     */
    export async function addCard(
        title: string,
        tags: string[],
        content: string
    ): Promise<CardType> {
        try {
            return await invoke<CardType>('add_card', { title, tags, content });
        } catch (error) {
            console.error('Failed to add card:', error);
            throw error;
        }
    }

    /**
     * Delete a card from the repository
     */
    export async function deleteCard(id: string): Promise<boolean> {
        try {
            return await invoke<boolean>('delete_card', { id });
        } catch (error) {
            console.error(`Failed to delete card with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Update a card's title
     */
    export async function updateCardTitle(id: string, title: string): Promise<boolean> {
        try {
            return await invoke<boolean>('update_card_title', { id, title });
        } catch (error) {
            console.error(`Failed to update title for card ${id}:`, error);
            throw error;
        }
    }

    /**
     * Update a card's tags
     */
    export async function updateCardTags(id: string, tags: string[]): Promise<boolean> {
        try {
            return await invoke<boolean>('update_card_tags', { id, tags });
        } catch (error) {
            console.error(`Failed to update tags for card ${id}:`, error);
            throw error;
        }
    }

    /**
     * Update a card's content
     */
    export async function updateCardContent(id: string, content: string): Promise<boolean> {
        try {
            return await invoke<boolean>('update_card_content', { id, content });
        } catch (error) {
            console.error(`Failed to update content for card ${id}:`, error);
            throw error;
        }
    }
}
