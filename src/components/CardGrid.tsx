import React from 'react';
import { CardType } from '@types';
import Card from '@components/Card';
import '@styles/components/CardGrid.css';

interface CardGridProps {
    cards: CardType[];
    onDeleteCard: (id: string) => void;
}

const CardGrid: React.FC<CardGridProps> = ({
    cards,
    onDeleteCard
}) => {
    return (
        <div className="card-grid">
            {cards.map(card => (
                <Card
                    key={card.id}
                    card={card}
                    onDelete={onDeleteCard}
                />
            ))}
        </div>
    );
};

export default CardGrid;
