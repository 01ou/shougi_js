
function validateNone(...variables) {
    variables.forEach(variable => {
        if (variable === null || variable === undefined) {
            throw new Error(`Parameter cannot be null or undefined`);
        }
    });
}

function validatePosition(position, permissionNull = false) {
    if (permissionNull && position === null) {
        return;
    }

    if (!Array.isArray(position) || position.length !== 2 || typeof position[0] !== "number" || typeof position[0] !== "number") {
        throw new Error('Position must be a 2-element array: ' + position);
    }
}

function validatePositionList(positionList, permissionNull = false) {
    if (permissionNull && positionList === null) {
        return;
    }

    if (!Array.isArray(positionList)) {
        throw new Error('Position list must be an array');
    }

    for (const position of positionList) {
        if (!Array.isArray(position) || position.length !== 2) {
            console.error(positionList);
            throw new Error('Each position in the list must be a 2-element array');
        }
    }
}

function validateDirections(directions) {
    if (typeof directions !== 'object' || Object.keys(directions).length === 0) {
        throw new Error('Directions must be a non-empty object');
    }
}

export {
    validateNone,
    validatePosition,
    validatePositionList,
    validateDirections,
}