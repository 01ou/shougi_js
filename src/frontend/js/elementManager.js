import { Cell } from "./cell/cell.js";
import { GameManager } from "./gameManager.js";
const gameManager = GameManager.getInstance();
import { PieceManager } from "./piece/pieceManager.js";
import { validateNone } from "./util.js";

class ElementManager {
  static setPromoteButtonsDisplay(state, promoteButton = null, unPromoteButton = null) {
    const promoteButtonsContainer = document.getElementById('promote-buttons-container');
    promoteButtonsContainer.style.display = state ? 'flex' : 'none';

    if (state) {
      promoteButtonsContainer.innerHTML = '';
      promoteButtonsContainer.appendChild(promoteButton);
      promoteButtonsContainer.appendChild(unPromoteButton);
    }
  }

  static displayPromoteButtons(piece, targetCell) {
    try {
      validateNone(piece);
      Cell.validateCell(targetCell);
      const gameManager = GameManager.getInstance();
      gameManager.setPauseState(true);
      const promoteButton = this.createPromoteButton("成る", true, piece, targetCell);
      const unPromoteButton = this.createPromoteButton("成らず", false, piece, targetCell);
      ElementManager.setPromoteButtonsDisplay(true, promoteButton, unPromoteButton);
    } catch (error) {
      console.error("Error displaying promote buttons:", error);
    }
  }

  static createPromoteButton(text, state, piece, targetCell) {
    const promoteButton = document.createElement('button');
    promoteButton.addEventListener('click', function() {
        PieceManager.promotingPiece(state, piece, targetCell);
        ElementManager.setPromoteButtonsDisplay(false);
        gameManager.setPauseState(false);
        piece.boardManager.updateAllPieceMoveable();
    });
    promoteButton.textContent = text;
    return promoteButton;
  }
}

export { ElementManager };