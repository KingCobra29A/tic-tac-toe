//factory for player objects
const Player = () => {


    return {};
};

//module for the game board
const GameBoard = (() => {

    let board = [];

    const _resetBoard = () => board = [null, null, null, null, null, null, null, null, null];
    const _fillBoard = () => board = ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'];
    const debug_printBoard = () => console.log(board);

    return {debug_printBoard};

})();

//mode for controlling display to the DOM
const DisplayController = (() => {


    return {};
})();