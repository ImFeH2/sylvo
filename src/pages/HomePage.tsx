import React, { useState, useEffect } from 'react';
import { CardType } from '../types';
import CardGrid from '../components/CardGrid';
import { CardAPI } from '../lib/api';
import '../styles/pages/HomePage.css';

const HomePage: React.FC = () => {
    const [cards, setCards] = useState<CardType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            setLoading(true);
            const fetchedCards = await CardAPI.getAllCards();
            setCards(fetchedCards);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching cards:", error);
            setLoading(false);
        }
    };

    const handleDeleteCard = (cardId: string) => {
        setCards(cards.filter(card => card.id !== cardId));
    };

    const handleCreateCard = async () => {
        try {
            const newCard = await CardAPI.addCard("New Card", ["new"], "");
            setCards([...cards, newCard]);
        } catch (error) {
            console.error("Error creating card:", error);
        }
    };

    if (loading) {
        return <div className="loading">Loading cards...</div>;
    }

    return (
        <div className="home-page">
            <div className="controls">
                <button onClick={handleCreateCard} className="create-card-button">
                    Create New Card
                </button>
            </div>

            <CardGrid
                cards={cards}
                onDeleteCard={handleDeleteCard}
            />
        </div>
    );
};

export default HomePage;
