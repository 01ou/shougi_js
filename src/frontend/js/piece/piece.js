import { DIRECTIONS, CELLTYPE, MOVETYPE, directionsAround } from "../constants.js";
import { PositionManager } from "../positionManager.js";
import { validateNone, validatePosition, validatePositionList } from "../util.js";
import { GameManager } from "../gameManager.js";
const gameManager = GameManager.getInstance();

// ピースクラス
class Piece {
    constructor(boardManager, normalName, promoteName, moveType, isMajorPiece=false, position = null, team = false, isPromote = false) {
        // ピースごとに固定
        this.boardManager = boardManager;
        this.normalName = normalName;
        this.promoteName = promoteName;
        this.isMajorPiece = isMajorPiece;
        this.normalMoveType = moveType;

        // 成りで固定の変動
        this.name = this.isPromote ? promoteName : normalName;
        this.moveType = this.isPromote ? (this.isMajorPiece ? MOVETYPE.STRAIGHT : MOVETYPE.AROUND) : this.normalMoveType;

        // ゲーム中に変動
        this.position = position;
        this.currentMoveable = [];
        this.isPromote = isPromote;
        this.team = team;
        this.limitMovePositions = [];
    }
  
    setPromoteState(state) {
      this.isPromote = state;
      this.name = this.isPromote ? this.promoteName : this.normalName;
      this.moveType = this.isPromote ? (this.isMajorPiece ? MOVETYPE.STRAIGHT : MOVETYPE.AROUND) : this.normalMoveType;
    }
  
    updateCurrentMoveable() {
        let moveablePositions = this.getCurrentMoveable();

        if (this.limitMovePositions.length > 0) {
            moveablePositions = PositionManager.getFilterPositions(moveablePositions, this.limitMovePositions, true);
        }

        if (gameManager.checkedTeam === this.team) {
            const betweenPositions = gameManager.positionsBetweenCheckingPiece;
            moveablePositions = PositionManager.getFilterPositions(moveablePositions, betweenPositions, true);
        }

        this.currentMoveable = moveablePositions;
        this.limitMovePositions = [];
    }

    // 駒の移動可能な位置を返すメソッド
    getCurrentMoveable(removeAllyPosition = true, currentPosition = this.position) {
        const moveable = this.getMoveable();
        let moveablePositions = this.addPositionToMoveable(moveable);

        if (this.moveType === MOVETYPE.STRAIGHT) {
            moveablePositions = this.stopAndFlattenAndReflectStraight(moveablePositions);
        } else if (this.team === true) {
            moveablePositions = PositionManager.reflectPositions(currentPosition, moveablePositions);
        }
        
        if (removeAllyPosition) {
            moveablePositions = this.removeAllyPosition(moveablePositions);
        }

        return moveablePositions;
    }

    addPositionToMoveable(moveable, position = this.position) {
        validatePosition(position);
        let moveableList = [];
        if (this.moveType == MOVETYPE.STRAIGHT) {
            for (const positions of moveable) {
                validatePositionList(positions);
                const addedList = PositionManager.addPositionToList(position, positions);
                moveableList.push(addedList);
            }
        } else {
            moveableList = PositionManager.addPositionToList(position, moveable);
        }
        return moveableList;
    }

    stopAndFlattenAndReflectStraight(positionsList, currentPosition = this.position) {
        let resultList = [];
        for (const positions of positionsList) {
            for (const pos of positions) {
                let position = pos;
                
                if (this.team === true) {
                    position = PositionManager.reflectPosition(currentPosition, position);
                }

                const cellType = this.boardManager.getCellType(position, this.team);

                if (cellType === CELLTYPE.OUT) {
                    break;
                }

                resultList.push(position);

                if (cellType !== CELLTYPE.EMPTY) {
                    break;
                }
            }
        }
        return resultList;
    }

    removeAllyPosition(positions) {
        let posList = [];
        for (const pos of positions) {
            const cellType = this.boardManager.getCellType(pos, this.team);
            if (cellType === CELLTYPE.EMPTY || cellType === CELLTYPE.ENEMY) {
                posList.push(pos);
            }
        }
        return posList;
    }

    getMoveable(flat = false) {
        let moveable = [];

        if (this.isPromote) {
            moveable = this.getPromotedMoveable();
        } else {
            moveable = this.getNormalMoveable();
        }

        if (flat && this.moveType === MOVETYPE.STRAIGHT) {
            moveable = this.flattenStraight(moveable);
        }

        return moveable;
    }
  
    getNormalMoveable() {
      return null;
    }
  
    getPromotedMoveable() {
      if (this.isMajorPiece) {
        let moveableList = [];
        const aroundMoveables = PositionManager.around(directionsAround);
        const moveables = this.getNormalMoveable();

        aroundMoveables.forEach(around => {
            moveableList.push([around]);
        });

        moveables.forEach(moveable => {
            moveableList.push(moveable);
        });

        return moveableList;
      } else {
        const moveDirections = [DIRECTIONS.UP, DIRECTIONS.UPRIGHT, DIRECTIONS.UPLEFT, DIRECTIONS.RIGHT, DIRECTIONS.LEFT, DIRECTIONS.DOWN];
        return PositionManager.around(moveDirections);
      }
    }

    flattenStraight(moveables) {
        if (this.moveType != MOVETYPE.STRAIGHT) {
            console.error("must moveType straight. now: " + this.moveType);
        }

        let positions = [];
        
        moveables.forEach(moveable => {
            moveable.forEach(pos => {
                positions.push(pos);
            });
        });

        return positions;
    }
  
    // 駒を指定された位置に移動させるメソッド
    move(position) {
      // ボード内に位置があり、現在の位置と異なる場合にのみ移動を許可
      const inBoard = PositionManager.isWithinBoard(position) && position !== this.position;
      if (inBoard) {
        this.position = position;
      }
    }

    static validatePiece(piece) {
        validateNone(piece);
        if (!(piece.prototype instanceof Piece)) {
            throw new Error('pieceType must inherit from Piece');
        }
    }
}

export { Piece };
