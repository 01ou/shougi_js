import { BOARD_SIZE } from "../constants.js";
import { Piece } from "./piece.js";
import { validateNone, validatePosition, validatePositionList } from "../util.js"
import { PositionManager } from "../positionManager.js";
import { King, Gold, Pawn } from "./definePiece.js";

class PieceManager {
    static canPromote(position, team, piece) {
        if (!PieceManager.canBePromoted(piece) || !position){
            return false;
        }
        
        const isInPromotionZone = (team && position[1] <= 2) || (!team && position[1] >= 6);
        const isOutOfPromotionZone = (team && piece.position[1] <= 2) || (!team && piece.position[1] >= 6);
        
        return isInPromotionZone || isOutOfPromotionZone;
    }

    static canBePromoted(piece) {
        if (!piece || piece.isPromote) {
            return false;
        }
        
        const pieceType = piece.constructor;
        
        if (pieceType === King || pieceType === Gold || piece.isPromoted) {
            return false;
        }
        
        return true;
    }

    static promotingPiece = (state, piece, targetCell) => {
        piece.setPromoteState(state);
        targetCell.setPiece(piece);
        piece.updateCurrentMoveable();
    }

    static createNewPiece(boardManager, pieceType, position, team, isHoldPiece = false) {
        Piece.validatePiece(pieceType);
        validatePosition(position, isHoldPiece);
        validateNone(team);
        const newPiece = new pieceType(boardManager, position, team);
        if (!isHoldPiece) {
            newPiece.updateCurrentMoveable();
        }
        return newPiece;
    }

    static copyPiece(boardManager, piece, inversionTeam = false, position = null) {
        validateNone(boardManager, piece);
        const team = inversionTeam ? !piece.team : piece.team;
        const newPiece = this.createNewPiece(boardManager, piece.constructor, position, team, true);
        return newPiece;
    }
  
    static checkIfLineContainsPieces(line, piece) {
        if (!line || !piece) { //エラーは必要ない
            return true;
        }

        const boardManager = piece.boardManager;
        validateNone(boardManager);

      for (let i = 0; i < BOARD_SIZE; i++) {
        const pos = [line, i];
        const gotPiece = boardManager.getPiece(pos);
        
        if (gotPiece === null) {
            continue;
        }

        const sameTeam = gotPiece.team == piece.team;
        const samePiece = gotPiece.constructor == piece.constructor;
  
        if (sameTeam && samePiece && !gotPiece.isPromote) {
          return true;
        }
      }
      return false;
    }
  
    static checkCanMoveInsideBoard(piece, position) {
        validatePosition(position);
      if (!piece || !position) {
        return false;
      }
    
      const moveables = piece.getMoveable(true);
      for (const moveable of moveables) {
        const nextMoveable = PositionManager.addPositions(moveable, position);
        if (PositionManager.isWithinBoard(nextMoveable)) {
          return true;
        }
      }
    
      return false;
    }

    static checkCanPlacing(piece, position) {
      if (!piece || !position) { //エラーは必要ない
        return false;
      }

      const type = piece.constructor;
      const isCanMove = this.checkCanMoveInsideBoard(piece, position, false);

      if (!isCanMove) {
        return false;
      }
  
      switch (type) {
        case King:
          return false;
        case Pawn:
          const isContain = PieceManager.checkIfLineContainsPieces(position[0], piece);
          return !isContain;
      }

      return true;
    }

    static getPiecesMoveableAndContainPieces(pieces, targetPosition) {
      const containPieces = [];
      const moveablePositions = pieces.reduce((accumulator, piece) => {
        validateNone(piece);
        const pieceMoveablePositions = piece.getCurrentMoveable(false);
        validatePositionList(pieceMoveablePositions);
    
        if (!PositionManager.isWithinBoard(targetPosition)) {
          return accumulator; // targetPosition が盤面外にある場合、何も追加しない
        }
    
        pieceMoveablePositions.forEach(position => {
          if (PositionManager.isMatchPosition(position, targetPosition)) {
            containPieces.push(piece);
          }
          accumulator.push(position);
        });
        return accumulator;
      }, []);
    
      return [moveablePositions, containPieces];
    }

    static getPiecesPositions(pieces) {
      const positions = [];
      
      pieces.forEach(piece => {
          positions.push(piece.position);
      });
      
      return positions;
    }
}

export { PieceManager };
