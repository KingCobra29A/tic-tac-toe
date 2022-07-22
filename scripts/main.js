//factory for player objects
const Player = (marker) => {

    let _playerMarker = marker;
    const debug_printPlayer = () => console.log(_playerMarker);

    return {debug_printPlayer};
};

//module for the game board
const GameBoard = (() => {

    let board = [];
    let Player1;
    let Player2;

    const _resetBoard = () => board = [null, null, null, null, null, null, null, null, null];

    const _initPlayers = () => {
        Player1 = Player('X');
        Player2 = Player('O');

        Player1.debug_printPlayer();
        Player2.debug_printPlayer();
    }

    const _checkVictoryConditions = (marker) => {
    //   let mappedBoard = board.map(x => {if(x != marker){x = null;}})
    //   let nsDiag, snDiag;
    //   nsDiag = mappedBoard.filter(x =>)

    //   for(i; i<length; i++){
    //       if
    //       if (i % 4 == 0){
    //           if(board[i] == marker) nsDiag++;
    //       }
    //       if
    //   }

    };

    const pickSquare = (index) => {
        if(board[index] == null){
            board[index] = 'x';
            return true;
        }
        else{
            console.log("FUDGE OFF");
            return false;
        }
    };

    const initGameBoard = () => {

    }

    const debug_printBoard = () => console.log(board);

    return {debug_printBoard, pickSquare};

})();

//module for controlling display to the DOM
const DisplayController = (() => {

    let _DOMcontainer;
    let _modal;
    let _Board;
    let _playerOneSvgs = [
        "assets/noun-anaconda-1049196.svg",
        "assets/noun-cane-toad-1049204.svg",
        "assets/noun-crocodile-1049207.svg",
        "assets/noun-galapagos-turtle-1049213.svg"
    ];
    let _playerTwoSvgs = [
        "assets/noun-birdcage-3625667.svg",
        "assets/noun-dog-shampoo-3625686.svg",
        "assets/noun-fish-3625679.svg",
        "assets/noun-hamster-3625680.svg"
    ];

    let _playerOneSelection, _playerTwoSelection;

    //each element in _squares is an array: [dom-selector, index]
    let _squares = [];
    
    //helper function which is called by event listener on each square
    //makes a call to the GameBoard module to determine if the picked square is valid
    //based on return from GameBoard, DOM class is applied to DOM square
    const _toggleSquare = (index) => {
        console.log(index);
        if(GameBoard.pickSquare(index)){
            _squares[index][0].classList.add("toggledSquare");
        }        
    };

    //Generates the html, and applies the classes to render the tictactoe board.
    //applies a click-based event listener on each square, which calls _toggleSquare
    const _renderBoard = () => {

        _Board.classList.add("game-board");

        for(let i = 0; i < 9; i++){
            _squares[i] = [document.createElement("div"), i];
            _squares[i][0].classList.add("square");
            _Board.appendChild(_squares[i][0]);
            _squares[i][0].addEventListener('click', () => _toggleSquare(_squares[i][1]));
        };
        _Board.classList.add("display-disabled");
        //

    };

    const _userInput_radioSetup = (name, imgsrc) => {
        let radioRoot = document.createElement("div");
        let selections = [];
        for(let i = 0; i < 4; i++){
            selections[i] = [document.createElement("label"), document.createElement("input"), document.createElement("img")];
            selections[i][1].type = "radio";
            selections[i][1].name = name;
            selections[i][1].value = i;
            selections[i][2].src = imgsrc[i];
            selections[i][0].appendChild(selections[i][1]);
            selections[i][0].appendChild(selections[i][2]);
            selections[i][0].classList.add("radio-char-selection-square");
            radioRoot.appendChild(selections[i][0]);
            
        }
        selections[0][1].checked = true;
        radioRoot.classList.add("radio-char-selection");
        

        return radioRoot;
    }

    const _renderGameSetupModal = () => {
        

        _modal = document.createElement("div");
        _modal.classList.add("modal");
        
        _modal.appendChild(document.createElement("h1"));
        _modal.firstChild.appendChild(document.createTextNode("Tic-Tac-Toe"));
        _modal.appendChild(document.createElement("form"));
        _modal.childNodes[1].onsubmit = _submitModal;
        _modal.childNodes[1].appendChild(document.createElement("div"));
        _modal.childNodes[1].firstChild.classList.add("char-select-wrapper")
        _modal.childNodes[1].firstChild.appendChild(_userInput_radioSetup("P1Sel", _playerOneSvgs));
        _modal.childNodes[1].firstChild.appendChild(document.createTextNode("VS"));
        _modal.childNodes[1].firstChild.appendChild(_userInput_radioSetup("P2Sel", _playerTwoSvgs));
        _modal.childNodes[1].appendChild(document.createElement("input"));
        _modal.childNodes[1].childNodes[1].type = "submit";
        _modal.childNodes[1].childNodes[1].value = "FIGHT";
        _modal.childNodes[1].childNodes[1].classList.add("start-round-btn");

        _DOM.appendChild(_modal);
        
    }

    const _submitModal = () => {
        _playerOneSelection = document.querySelector('input[name="P1Sel"]:checked').value;
        _playerTwoSelection = document.querySelector('input[name="P2Sel"]:checked').value;
        console.log("Player 1 selection: " + _playerOneSelection + " Player 2 selection: " + _playerTwoSelection);
        _modal.classList.add("display-disabled");
        _Board.classList.remove("display-disabled");
        return false;
    }

    const initBoardDisplay = (DOM_selector) => {
        _DOM = DOM_selector;
        _Board = document.createElement("div");
        _DOM.appendChild(_Board);
        _renderBoard();
        _renderGameSetupModal();
    };

    return {initBoardDisplay};

})();




DisplayController.initBoardDisplay(document.querySelector(".game-board-location"));