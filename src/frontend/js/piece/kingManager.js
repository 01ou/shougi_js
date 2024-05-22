import { Piece } from "./piece.js";
import { MOVETYPE, directionsAround } from "../constants.js";
import { PositionManager } from "../positionManager.js";
import { PieceManager } from "./pieceManager.js";
import { GameManager } from "../gameManager.js";

const gameManager = GameManager.getInstance();

class KingManager extends Piece {
    // チェックまたはチェックメイトを確認し、移動可能な位置を制限する
    confirmCheckOrCheckmateAndMoveable(currentMoveable) {
        const originalMoveablePositions = currentMoveable;
        const cautionPieces = this.getCautionPiece();
        const [cautionPositions, checkingPieces] = PieceManager.getPiecesMoveableAndContainPieces(cautionPieces, this.position);

        // cautionPositions に含まれていない originalMoveablePositions の位置をフィルタリング
        const filteredMoveablePositions = PositionManager.getFilterPositions(originalMoveablePositions, cautionPositions, false);

        // チェックがある場合
        if (checkingPieces.length > 0 && gameManager.checkedTeam === null) {    
            this.check(checkingPieces);

            // チェックメイトの場合
            if (filteredMoveablePositions.length == 0) {
                const isMoveableAllyPiece = this.boardManager.checkIfMoveablePiece(this.team, true);
                if (!isMoveableAllyPiece) {
                    gameManager.checkmate(!this.team);
                }
            }

            // チェックを表示
            gameManager.displayCheckElement(this.team);
        }

        // 守備の移動を制限
        this.limitDefenseMoves();

        return filteredMoveablePositions;
    }

    // 注意が必要な駒を取得
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

    // チェックを行う
    check(checkingPieces) {
        const checkingPiecesLength = checkingPieces.length;
        if (checkingPiecesLength == 0) {
            return;
        }

        const firstCheckingPiece = checkingPieces[0];

        if (firstCheckingPiece.moveType === MOVETYPE.AROUND) {
            console.log(firstCheckingPiece);
            gameManager.check(this.team, [firstCheckingPiece.position]);
        } else {
            const includeEndPosition = checkingPiecesLength == 1;
            let betweenPositions = [];
            
            checkingPieces.forEach(piece => {
                if (piece.moveType === MOVETYPE.STRAIGHT) {
                    betweenPositions = betweenPositions.concat(PositionManager.getBetweenPositions(this.position, piece.position, includeEndPosition));
                }
            });
    
            gameManager.check(this.team, betweenPositions);
        }

        this.boardManager.updateAllPieceMoveable();
    }

    // 守備の移動を制限
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
                    const enemyMoveablePositions = piece.getCurrentMoveable(false, true, false);
                    console.log(enemyMoveablePositions);
                    if (PositionManager.isContainPosition(this.position, enemyMoveablePositions)) {
                        // 敵の駒が王を攻撃可能な場合、守備駒の移動を制限する
                        const betweenPositions = PositionManager.getBetweenPositions(this.position, checkingPosition, true);
                        protectingPiece.limitMovePositions = betweenPositions;
                    }
                    break; // この方向の探索を終了 
                }
                break;
            }
        }
    }
}

export { KingManager };
