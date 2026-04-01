export function stripPgn(raw) {
    return (raw || '')
        .replace(/\[[^\]]*\]/g, ' ')
        .replace(/\{[^}]*\}/g, ' ')
        .replace(/;[^\n\r]*/g, ' ')
        .replace(/\$\d+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function tokenizePgn(raw) {
    const cleaned = stripPgn(raw);
    if (!cleaned) return [];
    const split = cleaned
        .replace(/\(/g, ' ( ')
        .replace(/\)/g, ' ) ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    return split.filter((token) => {
        if (/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token)) return false;
        if (/^\d+\.(\.\.)?$/.test(token)) return false;
        if (/^\d+\.\.\.$/.test(token)) return false;
        return true;
    });
}

export function createLine() {
    const line = [];
    line.rootVariations = [];
    return line;
}

export function parsePgnTree(raw) {
    const tokens = tokenizePgn(raw);
    const mainline = createLine();
    const stack = [{ line: mainline, anchorNode: null }];
    let current = stack[0];

    for (const token of tokens) {
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

        const node = { san: token, variations: [] };
        current.line.push(node);
        current.anchorNode = node;
    }

    return mainline;
}

export function buildEvalTemplate(line, includeInitial = true) {
    const out = includeInitial ? ['x'] : [];
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
