import { Piece } from "./piece.js";
import { DIRECTIONS, MOVETYPE, directionsAround } from "../constants.js";
import { PositionManager } from "../positionManager.js";
import { PieceManager } from "./pieceManager.js";
import { GameManager } from "../gameManager.js";
const gameManager = GameManager.getInstance();

class King extends Piece {
    constructor(boardManager, position=null, team=false) {
        const name = !team ? "王" : "玉";
        super(boardManager, name, "", MOVETYPE.AROUND, true, position, team);
    }

    getNormalMoveable() {
        return PositionManager.around(directionsAround);
    }

    updateCurrentMoveable() {
        const originalMoveablePositions = this.getCurrentMoveable();
        const cautionPieces = this.getCautionPiece();
        const [cautionPositions, checkingPieces] = PieceManager.getPiecesMoveableAndContainPieces(cautionPieces, this.position);

        // cautionPositions に含まれていない originalMoveablePositions の位置をフィルタリング
        const filteredMoveablePositions = PositionManager.getFilterPositions(originalMoveablePositions, cautionPositions, false);

        if (checkingPieces.length > 0 && gameManager.checkedTeam === null) {            
            this.check(checkingPieces);

            if (filteredMoveablePositions.length == 0) {
                const isMoveableAllyPiece = this.boardManager.checkIfMoveablePiece(this.team, true);
                if (!isMoveableAllyPiece) {
                    gameManager.checkmate(!this.team);
                }
            }

            gameManager.displayCheckElement(this.team);
        }

        this.currentMoveable = filteredMoveablePositions;

        this.limitDefenseMoves();
    }

    getCautionPiece() {
        let cautionPieces = [];
        const enemyTeam = !this.team;
        const longDistancePieces = this.boardManager.getPiecesByMoveType(enemyTeam, [null, null] ,MOVETYPE.STRAIGHT, MOVETYPE.JUMP);
        const range = 2;
        const nearPieces = this.boardManager.getPiecesByMoveType(enemyTeam, [range, this.position], MOVETYPE.AROUND);
        cautionPieces = cautionPieces.concat(longDistancePieces);
        cautionPieces = cautionPieces.concat(nearPieces);
        return cautionPieces;
    }

    check(checkingPieces) {
        const includeEndPosition = checkingPieces.length < 2;

        let betweenPositions = includeEndPosition ? PieceManager.getPiecesPositions(checkingPieces) : [];
        
        checkingPieces.forEach(piece => {
            if (piece.moveType === MOVETYPE.STRAIGHT) {
                betweenPositions = betweenPositions.concat(PositionManager.getBetweenPositions(this.position, piece.position));
            }
        });

        gameManager.check(this.team, betweenPositions);
        this.boardManager.updateAllPieceMoveable();
    }

    limitDefenseMoves() {
        const straightPositionsAround = PositionManager.straight(directionsAround);
    
        for (const positions of straightPositionsAround) {
            let protectingPiece = null;
    
            for (const relativePosition of positions) {
                const checkingPosition = PositionManager.addPositions(this.position, relativePosition);
                const piece = this.boardManager.getPiece(checkingPosition, false);
    
                if (!piece) {
                    continue; // 空白マスの場合はスキップ
                }
    
                // 守備駒が未設定の場合、自チームの駒を守備駒に設定
                if (!protectingPiece) {
                    if (piece.team === this.team) {
                        protectingPiece = piece;
                        continue;
                    } else {
                        break; // 敵の駒が現れたらループ終了
                    }
                } 
                // 守備駒が設定されている場合、敵の直線移動可能な駒が攻撃範囲内か確認
                else if (piece.team !== this.team && piece.moveType === MOVETYPE.STRAIGHT) {
                    const enemyMoveablePositions = piece.getCurrentMoveable(false, false);
                    if (PositionManager.isContainPosition(protectingPiece.position, enemyMoveablePositions)) {
                        // 敵の駒が王を攻撃可能な場合、守備駒の移動を制限する
                        protectingPiece.limitMovePositions = PositionManager.getBetweenPositions(this.position, checkingPosition);
                    }
                    break; // この方向の探索を終了
                }
            }
        }
    }
}

class Bishop extends Piece {
    constructor(boardManager, position=null, team=false) {
        super(boardManager, "角", "馬", MOVETYPE.STRAIGHT, true, position, team);
    }

    getNormalMoveable() {
        const moveDirections = [DIRECTIONS.UPRIGHT, DIRECTIONS.DOWNRIGHT, DIRECTIONS.DOWNLEFT, DIRECTIONS.UPLEFT];
        return PositionManager.straight(moveDirections);
    }
}

class Rook extends Piece {
    constructor(boardManager, position=null, team=false) {
        super(boardManager, "飛", "竜", MOVETYPE.STRAIGHT, true, position, team);
    }

    getNormalMoveable() {
        const moveDirections = [DIRECTIONS.UP, DIRECTIONS.RIGHT, DIRECTIONS.DOWN, DIRECTIONS.LEFT];
        return PositionManager.straight(moveDirections);
    }
}

class Gold extends Piece {
    constructor(boardManager, position=null, team=false) {
        super(boardManager, "金", "", MOVETYPE.AROUND, false, position, team);
    }

    getNormalMoveable() {
        const moveDirections = [DIRECTIONS.UP, DIRECTIONS.UPRIGHT, DIRECTIONS.UPLEFT, DIRECTIONS.RIGHT, DIRECTIONS.LEFT, DIRECTIONS.DOWN];
        return PositionManager.around(moveDirections);
    }
}

class Silver extends Piece {
    constructor(boardManager, position=null, team=false) {
        super(boardManager, "銀", "成銀", MOVETYPE.AROUND, false, position, team);
    }

    getNormalMoveable() {
        const moveDirections = [DIRECTIONS.UP, DIRECTIONS.UPRIGHT, DIRECTIONS.UPLEFT, DIRECTIONS.DOWNRIGHT, DIRECTIONS.DOWNLEFT];
        return PositionManager.around(moveDirections);
    }
}

class Knight extends Piece {
    constructor(boardManager, position=null, team=false) {
        super(boardManager, "桂", "成桂", MOVETYPE.JUMP, false, position, team);
    }

    getNormalMoveable() {
        return PositionManager.jump([1, 2], [-1, 2]);
    }
}

class Lance extends Piece {
    constructor(boardManager, position=null, team=false) {
        super(boardManager, "香", "成香", MOVETYPE.STRAIGHT, false, position, team);
    }

    getNormalMoveable() {
        const moveDirections = [ DIRECTIONS.UP ];
        return PositionManager.straight(moveDirections);
    }
}

class Pawn extends Piece {
    constructor(boardManager, position=null, team=false) {
        super(boardManager, "歩", "と", MOVETYPE.AROUND, false, position, team);
    }

    getNormalMoveable() {
        const moveDirections = [DIRECTIONS.UP];
        return PositionManager.around(moveDirections);
    }
}

export {
    King, Bishop, Rook, Gold, Silver, Knight, Lance, Pawn,
}