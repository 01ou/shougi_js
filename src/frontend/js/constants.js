// 定数
const DIRECTIONS = {
    UP: { x: 0, y: 1 },
    DOWN: { x: 0, y: -1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    UPLEFT: { x: -1, y: 1 },
    UPRIGHT: { x: 1, y: 1 },
    DOWNLEFT: { x: -1, y: -1 },
    DOWNRIGHT: { x: 1, y: -1 }
  };

  const directionsAround = [
    DIRECTIONS.UP,
    DIRECTIONS.DOWN,
    DIRECTIONS.LEFT,
    DIRECTIONS.RIGHT,
    DIRECTIONS.UPLEFT,
    DIRECTIONS.UPRIGHT,
    DIRECTIONS.DOWNLEFT,
    DIRECTIONS.DOWNRIGHT
];
  
  const MOVETYPE = {
    AROUND: 'AROUND',
    STRAIGHT: 'STRAIGHT',
    JUMP: 'JUMP',
    ALL: 'ALL',
    NULL: null,
  }

  const CELLTYPE = {
    ALLY: 'ALLY',
    ENEMY: 'ENEMY',
    EMPTY: 'EMPTY',
    OUT: 'OUT',
    ENEMY_KING: 'ENEMY_KING',
  }
  
  const BOARD_SIZE = 9;
  const BLANK_MARK = "　";
  const CHECK_SIGN_DISPLAY_TIME = 1.2;

export {
    DIRECTIONS,
    directionsAround,
    MOVETYPE,
    CELLTYPE,
    BOARD_SIZE,
    BLANK_MARK,
    CHECK_SIGN_DISPLAY_TIME,
}