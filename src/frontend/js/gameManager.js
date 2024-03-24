import { CHECK_SIGN_DISPLAY_TIME } from "./constants.js";
import { validateNone } from "./util.js";

class GameManager {
    constructor() {
        this.nowTeam = false;
        this.turnCounter = 0;
        this.nowSelectCell = null;
        this.nowSelectHoldPiece = null;
        this.teamFalseHoldPiece = [];
        this.teamTrueHoldPiece = [];
        this.timer;
        this.checkedTeam = null;
        this.positionsBetweenCheckingPiece = [];
        this.pauseGame = false;
    }

    initializeGame() {
        this.resetGame();
    }

    resetGame() {
        this.nowTeam = false;
        this.nowSelectCell = null;
        this.nowSelectHoldPiece = null;
        this.teamFalseHoldPiece = [];
        this.teamTrueHoldPiece = [];
        this.pauseGame = false;
        this.updateDisplayHoldPieces();
    }

    nextTeam() {
        this.nowTeam = !this.nowTeam;
        this.turnCounter++;
        this.nowSelectCell = null;
        this.nowSelectHoldPiece = null;
        this.checkedTeam = null;
        this.positionsBetweenCheckingPiece = [];
        this.updateDisplayHoldPieces();
        console.log(this.turnCounter);
    }

    addHoldPieceToNowTeam(newPiece) {
        validateNone(newPiece);

        if (newPiece.team) {
            this.teamTrueHoldPiece.push(newPiece);
        } else {
            this.teamFalseHoldPiece.push(newPiece);
        }

        this.updateDisplayHoldPieces();
    }

    removePieceFromHold(removePiece) {
        if (!removePiece || removePiece.team == null || removePiece.team == undefined) {
            return;
        }
        const team = removePiece.team;
        switch (team) {
            case false:
                this.teamFalseHoldPiece = this.teamFalseHoldPiece.filter(piece => piece != removePiece);
                break;
            case true:
                this.teamTrueHoldPiece = this.teamTrueHoldPiece.filter(piece => piece != removePiece);
                break;
        }
        this.updateDisplayHoldPieces();
    }

    updateDisplayHoldPieces() {
        this.createHoldPiecesElement('team-false-hold-piece', this.teamFalseHoldPiece);
        this.createHoldPiecesElement('team-true-hold-piece', this.teamTrueHoldPiece);
    }

    holdPieceClickHandler(piece) {
        if (!piece || piece.team !== this.nowTeam || this.pauseGame) {
            return;
        }

        this.nowSelectCell = null;
        this.nowSelectHoldPiece = piece;
        this.updateDisplayHoldPieces();
        piece.boardManager.resetAllCellsState();
        piece.boardManager.updateAllCellsCanPlanting(true, piece);
    }

    createHoldPiecesElement(elementId, holdPieces) {
        const parentElement = document.getElementById(elementId);
        if (!parentElement) {
            return;
        }
        parentElement.innerHTML = '';
        holdPieces.forEach(piece => {
            const pieceElement = document.createElement('button');
            pieceElement.textContent = piece.name;
            if (piece === this.nowSelectHoldPiece) {
                pieceElement.classList.add('hold-button-select');
            } else {
                pieceElement.addEventListener('click', () => this.holdPieceClickHandler(piece)); // クリック時のイベントを追加
            }
            parentElement.appendChild(pieceElement);
        });
        return parentElement;
    }

    setPauseState(state) {
        this.pauseGame = state;
    }
    
    check(team, betweenPositions) {
        this.checkedTeam = team;
        this.positionsBetweenCheckingPiece = betweenPositions;
    }

    displayCheckElement(team) {
        const checkNotificationContainer = document.getElementById('check-notification-container');
        const checkNotification = document.getElementById('check-notification');

        checkNotification.textContent = ' 王手';
        this.setElementTeam(team, checkNotification);
        checkNotificationContainer.style.display = 'flex';

        // 既存のタイマーをクリアする
        clearTimeout(this.timer);
    
        // 新しいタイマーをセットする
        this.timer = setTimeout(() => {
            checkNotificationContainer.style.display = 'none';
        }, CHECK_SIGN_DISPLAY_TIME * 1000); // time 秒後に非表示にする
    }

    setElementTeam(team, element) {
        const falseTeamClass = 'team-false';
        const trueTeamClass = 'team-true';
        element.classList.toggle(falseTeamClass, !team);
        element.classList.toggle(trueTeamClass, team);
    }
    

    checkmate = (winTeam) => {
        this.setPauseState(true);
        const winningTeamDisplay = document.getElementById('winning-team-display');
        winningTeamDisplay.textContent = `${winTeam ? '後手' : '先手'}の勝利！`;
        winningTeamDisplay.style.display = 'flex';
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new GameManager();
        }
        return this.instance;
    }
}

GameManager.instance = null;

GameManager.getInstance().initializeGame();

export { GameManager };