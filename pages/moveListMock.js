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
            <main className="mock-page">
                <div className="mock-page-inner">
                    <h1 className="mock-title">MoveList Mock</h1>
                    <p className="mock-lead">
                        Test `updatePgn(pgn)`, `colorMoves(evalArray, userColor)` and `startLoadingAnimation()` directly from UI or console.
                    </p>

                    <div className="mock-panel">
                        <div className="mock-panel__strong">Sample to copy/paste</div>
                        <div className="mb-sm">
                            <div className="mock-label">PGN</div>
                            <code className="mock-code">{samplePgn}</code>
                        </div>
                        <div>
                            <div className="mock-label">Eval array</div>
                            <code className="mock-code">{sampleEval}</code>
                        </div>
                        <div className="mt-sm">
                            <button
                                type="button"
                                className="btn btn--muted"
                                onClick={() => {
                                    setPgnInput(samplePgn);
                                    setEvalInput(sampleEval);
                                }}
                            >
                                Fill Inputs With Sample
                            </button>
                        </div>
                    </div>

                    <div className="mock-stack">
                        <label className="mock-field">
                            <span>PGN input</span>
                            <textarea
                                value={pgnInput}
                                onChange={(e) => setPgnInput(e.target.value)}
                                placeholder="Paste PGN movetext here..."
                                rows={4}
                                className="mock-textarea"
                            />
                        </label>
                        <div>
                            <button type="button" onClick={handleUpdatePgn} className="btn btn--primary">Update PGN</button>
                            <button
                                type="button"
                                onClick={startLoadingAnimation}
                                className="btn btn--muted ml-2"
                            >
                                Show Loading
                            </button>
                        </div>

                        <label className="mock-field">
                            <span>Evaluation array (JSON)</span>
                            <input
                                value={evalInput}
                                onChange={(e) => setEvalInput(e.target.value)}
                                placeholder="Example: [0.4, -1.2, [0.1, 0.8], 0.2, -0.6]"
                                className="mock-input"
                            />
                        </label>

                        <div className="mock-row">
                            <label htmlFor="userColor">User color</label>
                            <select
                                id="userColor"
                                value={userColor}
                                onChange={(e) => setUserColor(e.target.value)}
                                className="mock-input file-select"
                            >
                                <option value="white">white</option>
                                <option value="black">black</option>
                            </select>
                            <button type="button" onClick={handleApplyEval} className="btn btn--primary">Apply eval colors</button>
                        </div>
                    </div>

                    {warning ? (
                        <div className="mock-warning">
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

                    <div className="mock-callback">
                        <strong>Callback preview:</strong>{' '}
                        {`onBrowsePositionChanged(index=${browseInfo.index}, variation=${JSON.stringify(browseInfo.variation)})`}
                    </div>
                </div>
            </main>
        </>
    );
}
