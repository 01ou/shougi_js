import { Piece } from "./piece.js";
import { DIRECTIONS, MOVETYPE, directionsAround } from "../constants.js";
import { PositionManager } from "../positionManager.js";
import { KingManager } from "./kingManager.js";

class King extends KingManager {
    constructor(boardManager, position=null, team=false) {
        const name = !team ? "王" : "玉";
        super(boardManager, name, "", MOVETYPE.AROUND, position, team, true, false);
    }

    getNormalMoveable() {
        return PositionManager.around(directionsAround);
    }

    updateCurrentMoveable() {
        const currentMoveable = this.getCurrentMoveable();
        this.currentMoveable = this.confirmCheckOrCheckmateAndMoveable(currentMoveable);
    }
}

class Bishop extends Piece {
    constructor(boardManager, position=null, team=false) {
        super(boardManager, "角", "馬", MOVETYPE.STRAIGHT, position, team, true, false);
    }

    getNormalMoveable() {
        const moveDirections = [DIRECTIONS.UPRIGHT, DIRECTIONS.DOWNRIGHT, DIRECTIONS.DOWNLEFT, DIRECTIONS.UPLEFT];
        return PositionManager.straight(moveDirections);
    }
}

class Rook extends Piece {
    constructor(boardManager, position=null, team=false) {
        super(boardManager, "飛", "竜", MOVETYPE.STRAIGHT, position, team, true, false);
    }

    getNormalMoveable() {
        const moveDirections = [DIRECTIONS.UP, DIRECTIONS.RIGHT, DIRECTIONS.DOWN, DIRECTIONS.LEFT];
        return PositionManager.straight(moveDirections);
    }
}

class Gold extends Piece {
    constructor(boardManager, position=null, team=false) {
        super(boardManager, "金", "", MOVETYPE.AROUND, position, team, false, false);
    }

    getNormalMoveable() {
        const moveDirections = [DIRECTIONS.UP, DIRECTIONS.UPRIGHT, DIRECTIONS.UPLEFT, DIRECTIONS.RIGHT, DIRECTIONS.LEFT, DIRECTIONS.DOWN];
        return PositionManager.around(moveDirections);
    }
}

class Silver extends Piece {
    constructor(boardManager, position=null, team=false) {
        super(boardManager, "銀", "成銀", MOVETYPE.AROUND, position, team, false, false);
    }

    getNormalMoveable() {
        const moveDirections = [DIRECTIONS.UP, DIRECTIONS.UPRIGHT, DIRECTIONS.UPLEFT, DIRECTIONS.DOWNRIGHT, DIRECTIONS.DOWNLEFT];
        return PositionManager.around(moveDirections);
    }
}

class Knight extends Piece {
    constructor(boardManager, position=null, team=false) {
        super(boardManager, "桂", "成桂", MOVETYPE.JUMP, position, team, false, true);
    }

    getNormalMoveable() {
        return PositionManager.jump([1, 2], [-1, 2]);
    }
}

class Lance extends Piece {
    constructor(boardManager, position=null, team=false) {
        super(boardManager, "香", "成香", MOVETYPE.STRAIGHT, position, team, false, true);
    }

    getNormalMoveable() {
        const moveDirections = [ DIRECTIONS.UP ];
        return PositionManager.straight(moveDirections);
    }
}

class Pawn extends Piece {
    constructor(boardManager, position=null, team=false) {
        super(boardManager, "歩", "と", MOVETYPE.AROUND, position, team, false, true);
    }

    getNormalMoveable() {
        const moveDirections = [DIRECTIONS.UP];
        return PositionManager.around(moveDirections);
    }
}

export {
    King, Bishop, Rook, Gold, Silver, Knight, Lance, Pawn,
}