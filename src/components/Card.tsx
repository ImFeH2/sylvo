import React, { useState, useRef, useEffect } from 'react';
import { CardType, formatTimestamp } from '@types';
import { CardAPI } from '@lib/api';
import '@styles/components/Card.css';

interface CardProps {
    card: CardType;
    onDelete: (id: string) => void;
}

const Card: React.FC<CardProps> = ({ card, onDelete }) => {
    const [localCard, setLocalCard] = useState<CardType>(card);
    const [editingField, setEditingField] = useState<'title' | 'content' | 'tags' | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [editTagsValue, setEditTagsValue] = useState<string[]>([]);
    const [deletingCard, setDeletingCard] = useState(false);
    const [newTagInput, setNewTagInput] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const editRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const tagInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalCard(card);
    }, [card]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (editRef.current && !editRef.current.contains(event.target as Node)) {
                saveCurrentEdit();
            }
        };

        if (editingField) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editingField, editValue, editTagsValue]);

    const saveCurrentEdit = async () => {
        if (editingField === null || isUpdating) return;

        try {
            setIsUpdating(true);
            let success = false;

            switch (editingField) {
                case 'title':
                    success = await CardAPI.updateCardTitle(localCard.id, editValue);
                    break;
                case 'content':
                    success = await CardAPI.updateCardContent(localCard.id, editValue);
                    break;
                case 'tags':
                    success = await CardAPI.updateCardTags(localCard.id, editTagsValue);
                    break;
            }

            if (success) {
                const updatedCard = await CardAPI.getCard(localCard.id);
                if (updatedCard) {
                    setLocalCard(updatedCard);
                }
            } else {
                console.error(`Failed to update ${editingField}`);
            }
        } catch (error) {
            console.error(`Error updating card: ${error}`);
        } finally {
            setIsUpdating(false);
            setEditingField(null);
            setNewTagInput('');
        }
    };

    const startEditing = (field: 'title' | 'content' | 'tags') => {
        setEditingField(field);

        if (field === 'title' || field === 'content') {
            setEditValue(localCard[field]);
        } else if (field === 'tags') {
            setEditTagsValue([...localCard.tags]);
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && editingField !== 'content') {
            e.preventDefault();
            saveCurrentEdit();
        } else if (e.key === 'Escape') {
            setEditingField(null);
            setNewTagInput('');
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            const success = await CardAPI.deleteCard(localCard.id);
            if (success) {
                onDelete(localCard.id);
            }
        } catch (error) {
            console.error("Error deleting card:", error);
        }
        setDeletingCard(false);
    };

    const handleDeleteClick = () => {
        setDeletingCard(true);
    };

    const handleDeleteTag = (index: number) => {
        const newTags = [...editTagsValue];
        newTags.splice(index, 1);
        setEditTagsValue(newTags);
    };

    const handleAddTag = () => {
        if (newTagInput.trim()) {
            setEditTagsValue([...editTagsValue, newTagInput.trim()]);
            setNewTagInput('');
            if (tagInputRef.current) {
                tagInputRef.current.focus();
            }
        }
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleEditTag = (index: number, newValue: string) => {
        if (newValue.trim()) {
            const newTags = [...editTagsValue];
            newTags[index] = newValue.trim();
            setEditTagsValue(newTags);
        } else {
            handleDeleteTag(index);
        }
    };

    const renderTitle = () => {
        if (editingField === 'title') {
            return (
                <input
                    ref={editRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={editValue}
                    onChange={handleEditChange}
                    onKeyDown={handleKeyDown}
                    className="edit-title"
                    autoFocus
                />
            );
        }
        return (
            <h3
                className="card-title"
                onClick={() => startEditing('title')}
            >
                {localCard.title || <em>Untitled</em>}
            </h3>
        );
    };

    const renderContent = () => {
        if (editingField === 'content') {
            return (
                <textarea
                    ref={editRef as React.RefObject<HTMLTextAreaElement>}
                    value={editValue}
                    onChange={handleEditChange}
                    onKeyDown={handleKeyDown}
                    className="edit-content"
                    autoFocus
                />
            );
        }
        return (
            <div
                className="card-content"
                onClick={() => startEditing('content')}
            >
                {localCard.content || <em>No content</em>}
            </div>
        );
    };

    const renderTags = () => {
        if (editingField === 'tags') {
            return (
                <div className="tag-editor">
                    <div className="edit-tags-container">
                        {editTagsValue.map((tag, index) => (
                            <div key={index} className="edit-tag">
                                <input
                                    type="text"
                                    value={tag}
                                    onChange={(e) => handleEditTag(index, e.target.value)}
                                    className="edit-tag-input"
                                />
                                <button
                                    className="delete-tag-button"
                                    onClick={() => handleDeleteTag(index)}
                                    title="Remove tag"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="add-tag-container">
                        <input
                            ref={tagInputRef}
                            type="text"
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            onKeyDown={handleTagInputKeyDown}
                            placeholder="Add a new tag..."
                            className="add-tag-input"
                        />
                        <button
                            className="add-tag-button"
                            onClick={handleAddTag}
                            disabled={!newTagInput.trim()}
                            title="Add tag"
                        >
                            +
                        </button>
                    </div>
                    <div className="tag-editor-actions">
                        <button
                            className="save-tags-button"
                            onClick={saveCurrentEdit}
                        >
                            Save
                        </button>
                        <button
                            className="cancel-edit-button"
                            onClick={() => setEditingField(null)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div
                className="card-tags"
                onClick={() => startEditing('tags')}
            >
                {localCard.tags.length > 0 ? (
                    <div className="tags-container">
                        {localCard.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                        ))}
                    </div>
                ) : (
                    <em>No tags</em>
                )}
            </div>
        );
    };

    return (
        <div className="card">
            <div className="card-header">
                {renderTitle()}
                <button
                    className="delete-card-button"
                    onClick={handleDeleteClick}
                    aria-label="Delete card"
                    title="Delete card"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            {renderTags()}
            {renderContent()}
            <div className="card-footer">
                <span className="timestamp">
                    {isUpdating ? 'Updating...' : `Updated: ${formatTimestamp(localCard.updated_at)}`}
                </span>
            </div>

            {deletingCard && (
                <div className="delete-confirmation">
                    <div className="delete-confirmation-content">
                        <p>Are you sure you want to delete this card?</p>
                        <div className="delete-confirmation-actions">
                            <button
                                className="confirm-delete-button"
                                onClick={handleDeleteConfirm}
                            >
                                Delete
                            </button>
                            <button
                                className="cancel-delete-button"
                                onClick={() => setDeletingCard(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Card;
