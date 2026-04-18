import { useId } from 'react';

/**
 * Small "i" control; hover or focus shows tooltip content (pass as children).
 */
export default function Explanation({ children, className = '', label = 'About this page' }) {
    const tipId = useId().replace(/:/g, '');
    return (
        <span className={`explanation ${className}`.trim()}>
            <button
                type="button"
                className="explanation__trigger"
                aria-label={label}
                aria-describedby={tipId}
            >
                <span className="explanation__i" aria-hidden>
                    i
                </span>
            </button>
            <span id={tipId} className="explanation__tooltip" role="tooltip">
                <span className="explanation__tooltip-inner">{children}</span>
            </span>
        </span>
    );
}
