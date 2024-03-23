import { BOARD_SIZE, CELLTYPE, MOVETYPE } from "./constants.js";
import { Cell } from "./cell/cell.js";
import { PieceManager } from "./piece/pieceManager.js";
import { validateNone, validatePosition, validatePositionList } from "./util.js";
import { PositionManager } from "./positionManager.js";
import { King, Bishop, Rook, Gold, Silver, Knight, Lance, Pawn } from "./piece/definePiece.js";
import { GameManager } from "./gameManager.js";
import { ElementManager } from "./ElementManager.js";
const gameManager = GameManager.getInstance();


class BoardManager {
    constructor() {
        this.board = Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }));
        this.instance = null;
        this.initializeBoard();
        this.initializeSetPiece();
    }

    initializeBoard() {
        this.setCellOfBoard();
        const boardElement = document.getElementById('board');
        if (!boardElement) {
            throw new Error("boardElement not found");
        }
        for (let row = 0; row < BOARD_SIZE; row++) {
            const tr = document.createElement('tr');
            for (let col = 0; col < BOARD_SIZE; col++) {
                const td = document.createElement('td');
                const position = [row, col];
                const [x, y] = this.convertPositionToIndex(position)
                const cell = this.board[x][y];
                td.appendChild(cell.element);
                tr.appendChild(td);
            }
            boardElement.appendChild(tr);
        }
    }

    setCellOfBoard() {
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                const [row, col] = this.convertPositionToIndex([x, y])
                this.board[row][col] = new Cell(this, [row, col]);
            }
        }
    }

    convertPositionToIndex(position) {
        const x = position[1];
        const y = BOARD_SIZE - position[0] - 1;
        return [x, y];
    }

    initializeSetPiece() {
        const set = (type, position) => {
            const reveresPosition = this.reversingPosition(position, true, false);
            const opponentPosition = this.reversingPosition(position, false, true);
            const reveresOpponentPosition = this.reversingPosition(position, true, true);
            this.setNewPiece(type, position, false);
            this.setNewPiece(type, reveresPosition, false);
            this.setNewPiece(type, opponentPosition, true);
            this.setNewPiece(type, reveresOpponentPosition, true);
        };

        const setPoint = (type, position) => {
            const opponentPosition = this.reversingPosition(position, true, true);
            this.setNewPiece(type, position, false);
            this.setNewPiece(type, opponentPosition, true);
        };

        setPoint(King, [4,0]);
        set(Gold, [3, 0]);
        set(Silver, [2, 0]);
        set(Knight, [1, 0]);
        set(Lance, [0, 0]);
        setPoint(Bishop, [1, 1]);
        setPoint(Rook, [7, 1]);
        set(Pawn, [0, 2]);
        set(Pawn, [1, 2]);
        set(Pawn, [2, 2]);
        set(Pawn, [3, 2]);
        setPoint(Pawn, [4, 2]); 

        this.updateAllPieceMoveable();
    }

    reversingPosition(position, reveresX=false, reveresY=false) {
        const x = reveresX ? BOARD_SIZE - position[0] - 1 : position[0];
        const y = reveresY ? BOARD_SIZE - position[1] - 1 : position[1];
        return [x, y];
    }

    getCell(position, throwOutBoardError = true) {
        if (PositionManager.isWithinBoard(position)) {
            const [x, y] = position;
            return this.board[x][y];
        } else if(throwOutBoardError) {
            throw new Error("Out of board range: " + position)
        }

        return null;
    }

    getPiece(position, throwOutBoardError = true) {
        validateNone(position);
        const cell = this.getCell(position, throwOutBoardError);
        return cell?.piece;
    }

    getCellType(position, team) {
        validatePosition(position, team);
        const isWithin = PositionManager.isWithinBoard(position);

        if (!isWithin) {
            return CELLTYPE.OUT;
        }

        const cell = this.getCell(position);
        Cell.validateCell(cell);
        const piece = cell.piece;

        if (!piece) {
            return CELLTYPE.EMPTY;
        }
        
        if (piece.team === team) {
            return CELLTYPE.ALLY;
        } else {
            return CELLTYPE.ENEMY;
        }
    }

    setPiece(piece, position) {
        validateNone(piece, position);
        const cell = this.getCell(position);
        Cell.validateCell(cell);
        cell.setPiece(piece);
    }

    setNewPiece(pieceType, position, team) {
        this.setPiece(PieceManager.createNewPiece(this, pieceType, position, team), position);
    }

    movePieceAtCell(beforeCell, targetCell) {
        const beforePiece = beforeCell?.piece;
        const targetPiece = targetCell?.piece;
    
        // 取得した駒がKingのとき、その反対(つまり自身)のチームを取得する
        const winTeam = targetPiece?.constructor == King ? !targetPiece?.team : null;
    
        if (!beforeCell || !targetCell || !beforePiece || !targetCell.isMoveable) {
            return;
        }
    
        if (targetPiece && beforePiece.team != targetPiece.team && winTeam == null) {
            const newPiece = PieceManager.copyPiece(this, targetPiece, true);
            gameManager.addHoldPieceToNowTeam(newPiece);
        }
       
        beforeCell.removePiece();
    
        if (winTeam == true || winTeam == false) {
            gameManager.checkmate(winTeam);
        }
    
        const canPromote = PieceManager.canPromote(targetCell.position, beforePiece.team, beforePiece);
        if (canPromote) {
          const canMove = PieceManager.checkCanMoveInsideBoard(beforePiece, targetCell.position);
          if (canMove) {
            ElementManager.displayPromoteButtons(beforePiece, targetCell);
            this.finishTurn(beforePiece);
          } else {
            PieceManager.promotingPiece(true, beforePiece, targetCell);
            this.finishTurn();
          }
        } else {
            targetCell.setPiece(beforePiece);
            this.finishTurn();
        }
    }

    finishTurn() {
        this.resetAllCellsState();
        this.updateAllPieceMoveable();
        gameManager.nextTeam();
    }

    setCellsMoveableState(positions) {
        validatePositionList(positions);
        positions.forEach(pos => {
            const cell = this.getCell(pos);
            if (cell) {
                cell.setMoveableState(true);
            }
        });
    }

    resetAllCellsState() {
        const cells = this.getAllCells();
        cells.forEach(cell => {
            cell.setMoveableState(false);
            cell.setSelectState(false);
        });
    }

    updateAllPieceMoveable() {
        const cells = this.getAllCells();
        cells.forEach(cell => {
            const piece = cell.piece;
            if (piece) {
                piece.updateCurrentMoveable();
            }
        });
    }

    getAllCells() {
        let cells = [];
        this.board.forEach(row => {
            row.forEach(cell => {
                if (cell) {
                    cells.push(cell);
                }
            });
        });
        return cells;
    }

    getPiecesByMoveType(team = null, [range, position] = [null, null], ...moveTypes) {
        let cells = [];

        if (range && position) {
            cells = this.getCellsInRange(position, range);
        } else {
            cells = this.getAllCells();
        }

        validateNone(cells);
        const sameTeam = (piece, team) => team === null ? true : piece.team === team;
        const matchMoveType = (piece, moveTypes) =>
            moveTypes.length === 0
            || moveTypes.includes(piece.moveType)
            || moveTypes.includes(MOVETYPE.ALL);
        return cells
            .map(cell => cell.piece)
            .filter(piece => piece && sameTeam(piece, team) && matchMoveType(piece, moveTypes));        
    }

    getCellsInRange(centerPosition, range) {
        const cells = [];
        for (let x = -range; x <= range; x++) {
            for (let y = -range; y <= range; y++) {
                const position = [centerPosition[0] + x, centerPosition[1] + y];
                validatePosition(position);

                if (PositionManager.isWithinBoard(position)) {
                    const cell = this.getCell(position);
                    cells.push(cell);
                }
            }
        }
        return cells;
    }

    checkIfMoveablePiece(team, excludeKing = false) {
        const cells = this.getAllCells();
        for (const cell of cells) {
            const piece = cell.piece;
            if (piece && piece.team === team && (!excludeKing || piece.constructor !== King) && piece.currentMoveable.length > 0) {
                return true;
            }
        }
        return false;
    }
    

    static getInstance() {
        if (!this.instance) {
            this.instance = new BoardManager();
        }
        return this.instance;
    }
}

BoardManager.getInstance();

export { BoardManager };
