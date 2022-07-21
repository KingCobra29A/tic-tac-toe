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
//input parameter is DOM selector where the board will be rendered 
const DisplayController = (() => {

    let _DOM;

    //each element is _squares is an array: [dom-selector, index]
    let _squares = [];
    
    const _toggleSquare = (index) => {
        console.log(index);
    };

    const _renderBoard = () => {

        _DOM.classList.add("game-board");

        for(let i = 0; i < 9; i++){
            _squares[i] = [document.createElement("div"), i];
            _squares[i][0].classList.add("square");
            _DOM.appendChild(_squares[i][0]);
            _squares[i][0].addEventListener('click', () => _toggleSquare(_squares[i][1]));
        };
    };

    const initBoard = (DOM_selector) => {
        _DOM = DOM_selector;
        _renderBoard();
    };

    return {initBoard};

})();



DisplayController.initBoard(document.querySelector(".game-board-location"));