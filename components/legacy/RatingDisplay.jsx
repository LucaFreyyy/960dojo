import React from 'react';

export default function RatingDisplay({ rating = 1500, onRatingChange }) {
    return (
        <section className="text-output" style={{ marginLeft: '-250px', display: 'flex', alignItems: 'center' }}>
            <span className="rating-box">
                Rating: <span>{rating}</span>
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', marginLeft: '8px' }}>
                <button
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', height: '28px' }}
                    onClick={() => onRatingChange?.(rating + 1)}
                >
                    <svg width="28" height="20" viewBox="0 0 14 10" style={{ display: 'block' }}>
                        <polygon points="7,2 2,8 12,8" fill="#adf" />
                    </svg>
                </button>
                <button
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', height: '28px' }}
                    onClick={() => onRatingChange?.(rating - 1)}
                >
                    <svg width="28" height="20" viewBox="0 0 14 10" style={{ display: 'block' }}>
                        <polygon points="2,2 12,2 7,8" fill="#adf" />
                    </svg>
                </button>
            </span>
        </section>
    );
}
