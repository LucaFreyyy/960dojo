import Head from 'next/head';
import { useCallback, useEffect, useRef, useState } from 'react';
import MoveList, { buildEvalTemplate, createLine, parsePgnTree, validateEvalShape } from '../components/MoveList';

const samplePgn = '1. e4 e5 (1... c5 2. Nf3 d6) 2. Nf3 Nc6 (2... Nf6 3. Nxe5) 3. Bb5 a6';
const sampleEval = '[0.0, 0.2, 0.1, [-0.1, 0.0, -0.2], 0.3, 0.25, [0.05, -0.4], 0.4, 0.35]';


export default function MoveListMockPage() {
    const [pgnInput, setPgnInput] = useState('');
    const [pgn, setPgn] = useState('');
    const [evalInput, setEvalInput] = useState('');
    const [evalArray, setEvalArray] = useState([]);
    const [userColor, setUserColor] = useState('white');
    const [loading, setLoading] = useState(false);
    const [warning, setWarning] = useState('');
    const [browseInfo, setBrowseInfo] = useState({ index: -1, variation: [] });
    const treeRef = useRef(createLine());

    const onBrowsePositionChanged = useCallback((index, variation) => {
        setBrowseInfo({ index, variation });
    }, []);

    useEffect(() => {
        treeRef.current = parsePgnTree(pgn);
    }, [pgn]);

    const updatePgn = useCallback((nextPgn) => {
        setPgn(nextPgn || '');
        setLoading(false);
        setWarning('');
    }, []);

    const colorMoves = useCallback((nextEvalArray, nextUserColor = 'white') => {
        const template = buildEvalTemplate(treeRef.current);
        const validUserColor = nextUserColor === 'black' ? 'black' : 'white';
        if (!validateEvalShape(nextEvalArray, template)) {
            setEvalArray([]);
            setWarning(
                `Evaluation format mismatch. Expected shape like ${JSON.stringify(template)} `
                + `where each "x" is a number. Example with one variation: [x, x, [x, x], x, x].`
            );
            setLoading(false);
            return false;
        }
        setEvalArray(nextEvalArray);
        setUserColor(validUserColor);
        setWarning('');
        setLoading(false);
        return true;
    }, []);

    const startLoadingAnimation = useCallback(() => {
        setLoading(true);
    }, []);

    useEffect(() => {
        const prev = {
            updatePgn: window.updatePgn,
            colorMoves: window.colorMoves,
            startLoadingAnimation: window.startLoadingAnimation,
        };

        window.updatePgn = updatePgn;
        window.colorMoves = colorMoves;
        window.startLoadingAnimation = startLoadingAnimation;

        return () => {
            window.updatePgn = prev.updatePgn;
            window.colorMoves = prev.colorMoves;
            window.startLoadingAnimation = prev.startLoadingAnimation;
        };
    }, [colorMoves, startLoadingAnimation, updatePgn]);

    function handleUpdatePgn() {
        startLoadingAnimation();
        updatePgn(pgnInput);
    }

    function handleApplyEval() {
        startLoadingAnimation();
        try {
            const parsed = JSON.parse(evalInput);
            colorMoves(parsed, userColor);
        } catch {
            setWarning('Evaluation input is not valid JSON. Use arrays with numbers, e.g. [0.2, -0.4, [1.1, -0.3], 0.1].');
            setEvalArray([]);
            setLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>Move List Mock - 960 Dojo</title>
            </Head>
            <main style={{
                minHeight: '100vh',
                background: '#0b0f15',
                color: '#eef2fb',
                padding: '32px 20px 60px',
                fontFamily: 'Inter, Segoe UI, sans-serif',
            }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <h1 style={{ marginTop: 0, marginBottom: 14 }}>MoveList Mock</h1>
                    <p style={{ color: '#a8b3c7', marginTop: 0 }}>
                        Test `updatePgn(pgn)`, `colorMoves(evalArray, userColor)` and `startLoadingAnimation()` directly from UI or console.
                    </p>

                    <div style={{
                        marginBottom: 16,
                        background: '#121925',
                        border: '1px solid #2b3447',
                        borderRadius: 10,
                        padding: 12,
                        color: '#c7d2e8',
                    }}>
                        <div style={{ marginBottom: 8, fontWeight: 700 }}>Sample to copy/paste</div>
                        <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 13, color: '#9fb0cf', marginBottom: 4 }}>PGN</div>
                            <code style={{ display: 'block', whiteSpace: 'pre-wrap', userSelect: 'all' }}>{samplePgn}</code>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: '#9fb0cf', marginBottom: 4 }}>Eval array</div>
                            <code style={{ display: 'block', whiteSpace: 'pre-wrap', userSelect: 'all' }}>{sampleEval}</code>
                        </div>
                        <div style={{ marginTop: 10 }}>
                            <button
                                type="button"
                                style={{ ...primaryBtnStyle, background: '#3a445c', border: '1px solid #586684' }}
                                onClick={() => {
                                    setPgnInput(samplePgn);
                                    setEvalInput(sampleEval);
                                }}
                            >
                                Fill Inputs With Sample
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                        <label style={{ display: 'grid', gap: 6 }}>
                            <span>PGN input</span>
                            <textarea
                                value={pgnInput}
                                onChange={(e) => setPgnInput(e.target.value)}
                                placeholder="Paste PGN movetext here..."
                                rows={4}
                                style={{
                                    background: '#141a24',
                                    color: '#ecf2ff',
                                    border: '1px solid #2d3647',
                                    borderRadius: 8,
                                    padding: 10,
                                }}
                            />
                        </label>
                        <div>
                            <button type="button" onClick={handleUpdatePgn} style={primaryBtnStyle}>Update PGN</button>
                            <button
                                type="button"
                                onClick={startLoadingAnimation}
                                style={{ ...primaryBtnStyle, marginLeft: 8, background: '#3a445c', border: '1px solid #586684' }}
                            >
                                Show Loading
                            </button>
                        </div>

                        <label style={{ display: 'grid', gap: 6 }}>
                            <span>Evaluation array (JSON)</span>
                            <input
                                value={evalInput}
                                onChange={(e) => setEvalInput(e.target.value)}
                                placeholder="Example: [0.4, -1.2, [0.1, 0.8], 0.2, -0.6]"
                                style={inputStyle}
                            />
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <label htmlFor="userColor">User color</label>
                            <select
                                id="userColor"
                                value={userColor}
                                onChange={(e) => setUserColor(e.target.value)}
                                style={inputStyle}
                            >
                                <option value="white">white</option>
                                <option value="black">black</option>
                            </select>
                            <button type="button" onClick={handleApplyEval} style={primaryBtnStyle}>Apply eval colors</button>
                        </div>
                    </div>

                    {warning ? (
                        <div style={{
                            marginBottom: 12,
                            color: '#ffd6d6',
                            background: '#3a2020',
                            border: '1px solid #8a3a3a',
                            borderRadius: 8,
                            padding: '10px 12px',
                        }}>
                            {warning}
                        </div>
                    ) : null}

                    <MoveList
                        pgn={pgn}
                        evalData={evalArray}
                        userColor={userColor}
                        loading={loading}
                        onBrowsePositionChanged={onBrowsePositionChanged}
                    />

                    <div style={{
                        marginTop: 16,
                        background: '#121925',
                        border: '1px solid #2b3447',
                        borderRadius: 10,
                        padding: 12,
                        color: '#c7d2e8',
                    }}>
                        <strong>Callback preview:</strong>{' '}
                        {`onBrowsePositionChanged(index=${browseInfo.index}, variation=${JSON.stringify(browseInfo.variation)})`}
                    </div>
                </div>
            </main>
        </>
    );
}

const inputStyle = {
    background: '#141a24',
    color: '#ecf2ff',
    border: '1px solid #2d3647',
    borderRadius: 8,
    padding: '8px 10px',
};

const primaryBtnStyle = {
    background: '#2a5fd3',
    color: '#fff',
    border: '1px solid #4b7de7',
    borderRadius: 8,
    padding: '8px 12px',
    fontWeight: 700,
    cursor: 'pointer',
};
