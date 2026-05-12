export function stripPgn(raw) {
    return (raw || '')
        .replace(/\[[^\]]*\]/g, ' ')
        .replace(/;[^\n\r]*/g, ' ')
        .replace(/\$\d+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function tokenizePgn(raw) {
    const cleaned = stripPgn(raw);
    if (!cleaned) return [];
    const out = [];
    let i = 0;
    while (i < cleaned.length) {
        const ch = cleaned[i];
        if (/\s/.test(ch)) {
            i += 1;
            continue;
        }
        if (ch === '(' || ch === ')') {
            out.push(ch);
            i += 1;
            continue;
        }
        if (ch === '{') {
            const start = i;
            i += 1;
            while (i < cleaned.length && cleaned[i] !== '}') i += 1;
            if (i < cleaned.length && cleaned[i] === '}') i += 1;
            out.push(cleaned.slice(start, i));
            continue;
        }
        // regular token
        let j = i;
        while (j < cleaned.length && !/\s/.test(cleaned[j]) && cleaned[j] !== '(' && cleaned[j] !== ')' && cleaned[j] !== '{' && cleaned[j] !== '}') {
            j += 1;
        }
        out.push(cleaned.slice(i, j));
        i = j;
    }

    return out.filter((token) => {
        if (/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token)) return false;
        if (/^\d+\.(\.\.)?$/.test(token)) return false;
        if (/^\d+\.\.\.$/.test(token)) return false;
        return true;
    });
}

export function createLine() {
    const line = [];
    line.rootVariations = [];
    line.rootComment = '';
    return line;
}

export function parsePgnTree(raw) {
    const tokens = tokenizePgn(raw);
    const mainline = createLine();
    const stack = [{ line: mainline, anchorNode: null }];
    let current = stack[0];

    for (const token of tokens) {
        if (token.startsWith('{') && token.endsWith('}')) {
            const comment = token.slice(1, -1).trim();
            if (comment) {
                if (current.anchorNode) {
                    current.anchorNode.comment = comment;
                } else {
                    current.line.rootComment = current.line.rootComment
                        ? `${current.line.rootComment}\n${comment}`
                        : comment;
                }
            }
            continue;
        }
        if (token === '(') {
            const variation = createLine();
            if (current.anchorNode) {
                current.anchorNode.variations.push(variation);
            } else {
                current.line.rootVariations.push(variation);
            }
            stack.push({ line: variation, anchorNode: null });
            current = stack[stack.length - 1];
            continue;
        }
        if (token === ')') {
            if (stack.length > 1) stack.pop();
            current = stack[stack.length - 1];
            continue;
        }
        if (token.includes('.')) continue;

        const node = { san: token, variations: [], comment: '' };
        current.line.push(node);
        current.anchorNode = node;
    }

    return mainline;
}

export function buildEvalTemplate(line, includeInitial = true) {
    const out = includeInitial ? ['x'] : [];
    if (includeInitial) {
        for (const variation of line?.rootVariations || []) {
            out.push(buildEvalTemplate(variation, false));
        }
    }
    for (const node of line) {
        out.push('x');
        for (const variation of node.variations) {
            out.push(buildEvalTemplate(variation, false));
        }
    }
    return out;
}

export function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}

export function validateEvalShape(value, template) {
    if (!Array.isArray(value) || !Array.isArray(template)) return false;
    if (value.length !== template.length) return false;
    for (let i = 0; i < template.length; i += 1) {
        const expected = template[i];
        const actual = value[i];
        if (Array.isArray(expected)) {
            if (!validateEvalShape(actual, expected)) return false;
        } else if (!isFiniteNumber(actual)) {
            return false;
        }
    }
    return true;
}
