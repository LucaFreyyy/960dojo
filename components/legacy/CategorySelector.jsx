import React from 'react';

export default function CategorySelector() {
    return (
        <select id="Category" className="dropdown">
            <option value="Random">Random</option>
            <option value="Number Selection">Number Selection</option>
            <option value="Standard">Standard</option>
            <option value="Fixed Piece">Fixed Piece</option>
        </select>
    );
}