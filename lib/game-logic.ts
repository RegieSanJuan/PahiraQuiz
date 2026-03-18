export interface GameBoard {
  grid: string[][];
  words: Word[];
  selectedPath: Position[];
  solvedWords: Set<string>;
}

export interface Position {
  row: number;
  col: number;
}

export interface Word {
  text: string;
  clue: string;
  positions: Position[];
  direction: Direction;
}

export type Direction = 'horizontal' | 'vertical' | 'diagonal';

export const GAME_CONFIG = {
  gridSize: 8,
  romanticMessage: "I LOVE YOU WITH ALL MY HEART",
  words: [
    { text: "LOVE", clue: "Mahal" },
    { text: "HEART", clue: "Puso" },
    { text: "YOU", clue: "Ikaw" },
    { text: "FOREVER", clue: "Habambuhay" },
    { text: "SMILE", clue: "Ngiti" },
    { text: "DREAM", clue: "Pangarap" },
  ],
};

export function initializeBoard(): GameBoard {
  const grid = createEmptyGrid(GAME_CONFIG.gridSize);
  const words = placeWordsOnGrid(grid, GAME_CONFIG.words);
  
  return {
    grid,
    words,
    selectedPath: [],
    solvedWords: new Set(),
  };
}

function createEmptyGrid(size: number): string[][] {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill(""));
}

function placeWordsOnGrid(
  grid: string[][],
  wordList: Array<{ text: string; clue: string }>
): Word[] {
  const placedWords: Word[] = [];

  for (const wordData of wordList) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 500;

    while (!placed && attempts < maxAttempts) {
      const direction = getRandomDirection();
      const startRow = Math.floor(Math.random() * GAME_CONFIG.gridSize);
      const startCol = Math.floor(Math.random() * GAME_CONFIG.gridSize);

      if (canPlaceWord(grid, wordData.text, startRow, startCol, direction)) {
        placeWord(grid, wordData.text, startRow, startCol, direction);
        placedWords.push({
          text: wordData.text,
          clue: wordData.clue,
          positions: getWordPositions(
            wordData.text,
            startRow,
            startCol,
            direction
          ),
          direction,
        });
        placed = true;
      }
      attempts++;
    }
  }

  // Fill remaining empty cells with random letters
  fillEmptyCells(grid);

  return placedWords;
}

function getRandomDirection(): Direction {
  const directions: Direction[] = ["horizontal", "vertical", "diagonal"];
  return directions[Math.floor(Math.random() * directions.length)];
}

function canPlaceWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction
): boolean {
  for (let i = 0; i < word.length; i++) {
    let row = startRow;
    let col = startCol;

    if (direction === "horizontal") col += i;
    else if (direction === "vertical") row += i;
    else if (direction === "diagonal") {
      row += i;
      col += i;
    }

    if (
      row < 0 ||
      row >= GAME_CONFIG.gridSize ||
      col < 0 ||
      col >= GAME_CONFIG.gridSize
    ) {
      return false;
    }

    if (grid[row][col] && grid[row][col] !== word[i]) {
      return false;
    }
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction
): void {
  for (let i = 0; i < word.length; i++) {
    let row = startRow;
    let col = startCol;

    if (direction === "horizontal") col += i;
    else if (direction === "vertical") row += i;
    else if (direction === "diagonal") {
      row += i;
      col += i;
    }

    grid[row][col] = word[i];
  }
}

function getWordPositions(
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction
): Position[] {
  const positions: Position[] = [];
  for (let i = 0; i < word.length; i++) {
    let row = startRow;
    let col = startCol;

    if (direction === "horizontal") col += i;
    else if (direction === "vertical") row += i;
    else if (direction === "diagonal") {
      row += i;
      col += i;
    }

    positions.push({ row, col });
  }
  return positions;
}

function fillEmptyCells(grid: string[][]): void {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (!grid[row][col]) {
        grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

export function isAdjacentCell(pos1: Position, pos2: Position): boolean {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
}

export function getSelectedWord(
  path: Position[],
  grid: string[][]
): string {
  return path.map((pos) => grid[pos.row][pos.col]).join("");
}

export function checkIfWordValid(
  selectedWord: string,
  words: Word[]
): Word | undefined {
  return words.find(
    (word) =>
      word.text === selectedWord ||
      word.text === selectedWord.split("").reverse().join("")
  );
}

export function isGameComplete(
  solvedWords: Set<string>,
  words: Word[]
): boolean {
  return solvedWords.size === words.length;
}
