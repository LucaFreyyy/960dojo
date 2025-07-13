// pages/legacy.js
import Head from 'next/head';
import { useEffect } from 'react';

export default function LegacyPage() {
    useEffect(() => {
        // Dynamically load and run old JS files on mount
        const scriptFiles = [
            'constants_and_globals.js',
            'chess_constants.js',
            'chess_logic.js',
            'utility_functions.js',
            'login_and_user.js',
            'move_list_display.js',
            'square_click_handling.js',
            'board_setup_and_drawing.js',
            'game_mode_and_color_selection.js',
            'game_flow.js',
            'event_listeners_and_init.js',
            'stockfish.js',
            'index.js', // usually contains init logic
        ];

        scriptFiles.forEach((file) => {
            const script = document.createElement('script');
            script.src = `/legacy-site/js/${file}`;
            script.async = false; // run in order
            document.body.appendChild(script);
        });

        return () => {
            // Optional: cleanup if needed
        };
    }, []);

    return (
        <>
            <Head>
                <title>Legacy Chess Page</title>
                {/* Load CSS files */}
                <link rel="stylesheet" href="/legacy-site/css/base.css" />
                <link rel="stylesheet" href="/legacy-site/css/buttons.css" />
                <link rel="stylesheet" href="/legacy-site/css/chessboard.css" />
                <link rel="stylesheet" href="/legacy-site/css/dropdown.css" />
                <link rel="stylesheet" href="/legacy-site/css/others.css" />
                <link rel="stylesheet" href="/legacy-site/css/selectors.css" />
            </Head>

            <div id="root">
                {/* Paste and adapt HTML from `index.html` here */}
            </div>
        </>
    );
}
