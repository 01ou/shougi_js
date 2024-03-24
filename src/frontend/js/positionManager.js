import { validateDirections, validatePosition, validatePositionList } from "./util.js";
import { DIRECTIONS, BOARD_SIZE } from "./constants.js";

class PositionManager {
    static addPositions(...positions) {
        // 位置合計を格納する変数を初期化
        let totalX = 0;
        let totalY = 0;
    
        // 各位置を合計に追加
        positions.forEach(position => {
            // エラーチェック: 位置が2つの要素からなる配列であることを確認する
            validatePosition(position);
            totalX += parseInt(position[0]);
            totalY += parseInt(position[1]);
        });
    
        // 結果を返す
        return [totalX, totalY];
    }

    static addPosition(position, positions) {
        let posList = [position];
        positions.forEach(pos => {
            posList.push(pos[0]);
        });
        // 位置合計を格納する変数を初期化
        let totalX = 0;
        let totalY = 0;

        // 各位置を合計に追加
        posList.forEach(position => {
            // エラーチェック: 位置が2つの要素からなる配列であることを確認する
            validatePosition(position);
    
            totalX += position[0];
            totalY += position[1];
        });
    
        // 結果を返す
        return [totalX, totalY];
    }

    static addPositionToList(position, positionList) {
        let posList = [];
        validatePosition(position);
        validatePositionList(positionList);
        positionList.forEach(pos => {
            const addedPos =  this.addPositions(position, pos);
            posList.push(addedPos);
        });
        return posList;
    }

    // 1マス以内の移動可能な位置を返すメソッド
    static around(directions) {
        validateDirections(directions);
    
        // 移動可能な位置を格納する配列を初期化
        let movableList = [];
    
        // 各方向に対して移動可能な位置を計算し、配列に追加する
        for (const direction in directions) {
            if (directions.hasOwnProperty(direction)) {
                const { x, y } = directions[direction];
                movableList.push([x, y]);
            }
        }
    
        // 移動可能な位置の配列を返す
        return movableList;
    }
    
    // 直線方向の移動可能な位置を返すメソッド
    static straight(directions) {
        validateDirections(directions);
        if (typeof directions[0] == 'number' && typeof directions[1] == 'number') {
            directions = [directions];
        }

        let moveableList = [];

        for (const direction in directions) {
            const { x, y } = directions[direction];
            let oneWayMoveableList = [];
            const originalPosition = [x, y];
    

            // 指定された方向に移動し、重複を削除するかどうかを確認する
            for (let i = 0; i < BOARD_SIZE; i++) {
                const pos = [originalPosition[0] * i, originalPosition[1] * i];
                if (pos[0] == 0 && pos[1] == 0) {
                    continue;
                }
                oneWayMoveableList.push(pos);
            }
            moveableList.push(oneWayMoveableList); // 方向と移動可能な位置のリストを追加す
        }
        return moveableList;
    }

    static jump(...positions) {
        validatePositionList(positions);
        let posList = [];
        positions.forEach(position => {
            posList.push(position);
        });
        return positions;
    }

    static isWithinBoard(position, throwError = false) {
        validatePosition(position);
        const [x, y] = position;
        const isWithin = x >= 0 && y >= 0 && x < BOARD_SIZE && y < BOARD_SIZE;
        if (!isWithin && throwError) {
            throw new Error('Position is outside the board.');
        }
        return isWithin;
    }

    // ポジションを反転させるメソッド
    static reflectPositions(currentPosition, positions) {
        validatePosition(currentPosition);
        validatePositionList(positions);
        const [posX, posY] = currentPosition;

        // ポジションを反転させる
        const refPositions = positions.map(([x, y]) => [2 * posX - x, 2 * posY - y]);
        return refPositions;
    }

    static reflectPosition(currentPosition, position) {
        validatePosition(currentPosition);
        validatePosition(position)
        const [posX, posY] = currentPosition;
        const [x, y] = position;

        // ポジションを反転させる
        const refPosition =  [2 * posX - x, 2 * posY - y];
        return refPosition;
    }

    static countContainPosition(targetPosition, positionList) {
        if (!targetPosition || !positionList || positionList.length == 0) {
            return 0;
        }

        validatePosition(targetPosition);
        validatePositionList(positionList);

        const count = positionList.filter(pos => pos[0] === targetPosition[0] && pos[1] === targetPosition[1]).length;

        return count;
    }

    static isContainPosition(position, positions) {
        validatePosition(position);
        validateDirections(positions);

        return positions.some(pos => pos[0] === position[0] && pos[1] === position[1]);
    }
    
    static isMatchPosition(...positions) {
        // 引数の数をチェックする
        if (positions.length < 1) {
            throw new Error('At least one position must be provided.');
        }
    
        // 入力を検証する
        validatePositionList(positions);
    
        // 最初の位置とすべての位置を比較する
        const firstPosition = positions[0];
        for (let i = 1; i < positions.length; i++) {
            const currentPosition = positions[i];
            if (firstPosition[0] !== currentPosition[0] || firstPosition[1] !== currentPosition[1]) {
                return false;
            }
        }
        return true;
    }

    static getBetweenPositions(startPosition, endPosition, includeEndPosition) {
        validatePosition(startPosition);
        validatePosition(endPosition);
    
        const startX = startPosition[0];
        const startY = startPosition[1];
        const endX = endPosition[0];
        const endY = endPosition[1];
    
        const isDiagonal = Math.abs(startX - endX) === Math.abs(startY - endY);
        const isEvery = startX === endX || startY === endY;
    
        if (isDiagonal || isEvery) {
            const positions = [];
    
            if (isDiagonal) {
                // 対角線上の位置を取得する
                const dx = Math.sign(endX - startX);
                const dy = Math.sign(endY - startY);
                let x = startX + dx;
                let y = startY + dy;
    
                while (x !== endX || y !== endY) {
                    positions.push([x, y]);
                    x += dx;
                    y += dy;
                }
            } else {
                // 直線上の位置を取得する
                if (startX === endX) {
                    // 垂直方向の直線上の位置を取得する
                    const dy = Math.sign(endY - startY);
                    for (let y = startY + dy; y !== endY; y += dy) {
                        positions.push([startX, y]);
                    }
                } else {
                    // 水平方向の直線上の位置を取得する
                    const dx = Math.sign(endX - startX);
                    for (let x = startX + dx; x !== endX; x += dx) {
                        positions.push([x, startY]);
                    }
                }
            }

            if (includeEndPosition) {
                positions.push(endPosition);
            }

            return positions;
        } else {
            throw new Error('Start and end positions are not diagonal or on the same line.');
        }
    }

    static getFilterPositions(originalPositions, targetPositions, includeIfExist) {
        validatePositionList(originalPositions);
        validatePositionList(targetPositions);

        // originalPositions のうち、targetPositions に含まれるものを抽出する
        const resultPositions = originalPositions.filter(position => {
            // targetPositions に position が含まれているかどうかをチェック
            const isPositionIncluded = targetPositions.some(targetPos => {
                return targetPos[0] === position[0] && targetPos[1] === position[1];
            });
    
            // includeIfExist が true なら position が含まれているものを返す
            // includeIfExist が false なら position が含まれていないものを返す
            return includeIfExist ? isPositionIncluded : !isPositionIncluded;
        });
    
        return resultPositions;
    }
    
}

export { PositionManager };