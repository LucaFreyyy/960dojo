import React from 'react';

export default function NumberSelect({ value, onChange, disabled = false }) {
    return (
        <select
            className="dropdown"
            value={value}
            onChange={(e) => onChange?.(parseInt(e.target.value))}
            disabled={disabled}
        >
            {[...Array(960)].map((_, i) => (
                <option key={i} value={i}>{i}</option>
            ))}
        </select>
    );
}
