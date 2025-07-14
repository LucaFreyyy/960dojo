import { useEffect } from 'react';

export function useInitializeUI({ setMode, setColor }) {
    useEffect(() => {
        setMode('training');
        setColor('random');
    }, [setMode, setColor]);
}
