import { BLANK_MARK } from "../constants.js";
import { GameManager } from "../gameManager.js";
const gameManager = GameManager.getInstance();
import { PieceManager } from "../piece/pieceManager.js";
import { validateNone } from "../util.js";

class Cell {
    constructor(boardManager, position, piece = null) {
      this.position = position;
      this.piece = piece;
      this.isSelect = false;
      this.isMoveable = false;
      this.canPlanting = false;
      this.createElement();
      this.addClickListener();
      this.boardManager = boardManager;
    }
  
    createElement() {
      this.element = document.createElement('button');
      this.element.classList.add('cell');
      this.updatePieceDisplay();
    }
  
    addClickListener() {
      this.element.addEventListener("click", () => this.handleClick());
    }
  
    handleClick() {
        if (gameManager.pauseGame) {
            return;
        }

        if (this.isMoveable) {
            this.handleMoveableCellClick();
        } else if (this.isEmpty()) {
            this.handleEmptyCellClick();
        } else {
            this.handlePieceClick();
        }
    }

    handleMoveableCellClick() {
        // 駒を移動する
        this.boardManager.movePieceAtCell(gameManager.nowSelectCell, this);
    }
  
    handleEmptyCellClick() {
        // 駒を配置する
        const nowSelectHoldPiece = gameManager.nowSelectHoldPiece;
        if (this.canPlanting) {
            nowSelectHoldPiece.position = this.position;
            this.setPiece(nowSelectHoldPiece);
            gameManager.removePieceFromHold(nowSelectHoldPiece);
            this.boardManager.finishTurn();
            return;
        }
    }
  
    handlePieceClick() {
        // 駒を選択する
        if (this.piece.team == gameManager.nowTeam) {
            gameManager.nowSelectCell = this;
            const moveablePositions = this.piece.currentMoveable;
            this.boardManager.resetAllCellsState();
            this.boardManager.setCellsMoveableState(moveablePositions);
            gameManager.nowSelectHoldPiece = null;
            gameManager.updateDisplayHoldPieces();
            this.setSelectState(true);
            return;
        }
    }

    updateCanPlanting(isActive, piece = null) {
        this.canPlanting = isActive && piece && this.isEmpty()
            && (!piece.isLimitedMove || PieceManager.checkCanPlanting(piece, this.position));
        
        this.updateClass();
    }
  
    isEmpty() {
      return this.piece === null;
    }
  
    updatePieceDisplay() {
      this.element.textContent = this.piece ? this.piece.name : BLANK_MARK;
    }
  
    updateClass() {
      this.element.classList.toggle('select-cell', this.isSelect);
      this.element.classList.toggle('moveable-cell', this.isMoveable);
      this.element.classList.toggle('can-planting-cell', this.canPlanting);
      if (this.piece) {
        const { isMajorPiece, isPromote, team } = this.piece;
        this.element.classList.toggle('piece-major', isMajorPiece);
        this.element.classList.toggle('piece-promote', isPromote);
        gameManager.setElementTeam(team, this.element);
      }
    }
  
    setSelectState(state) {
        this.isSelect = state;
        this.updateClass();
    }
  
    setMoveableState(state) {
        this.isMoveable = state;
        this.updateClass();
    }
  
    setPiece(piece) {
        validateNone(piece);
        this.piece = piece;
        piece.move(this.position);
        this.updatePieceDisplay();
        this.updateClass();
    }
  
    removePiece() {
        this.piece = null;
        this.updatePieceDisplay();
        this.updateClass();
    }

    static validateCell(cell) {
        if (!(cell instanceof Cell)) {
            throw new Error('Invalid cell object: must be an instance of Cell class');
        }
    }
}

export { Cell };