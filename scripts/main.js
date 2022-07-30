//factory for player objects
const Player = (name) => {

    let _playerName = name;
    let _scoreCard = [false, false, false, false, false, false, false, false, false];

    const resetPlayer = () => {
        _scoreCard = [false, false, false, false, false, false, false, false, false];
    };

    const printPlayer = () => {
        return _playerName;
    };

    const addSelection = (index) => {
        _scoreCard[index] = true;
    };

    const checkVictoryConditions = () => {
        if(
            (_scoreCard[0] && _scoreCard[1] && _scoreCard[2]) ||
            (_scoreCard[3] && _scoreCard[4] && _scoreCard[5]) ||
            (_scoreCard[6] && _scoreCard[7] && _scoreCard[8]) ||
            (_scoreCard[0] && _scoreCard[3] && _scoreCard[6]) ||
            (_scoreCard[1] && _scoreCard[4] && _scoreCard[7]) ||
            (_scoreCard[2] && _scoreCard[5] && _scoreCard[8]) ||
            (_scoreCard[0] && _scoreCard[4] && _scoreCard[8]) ||
            (_scoreCard[6] && _scoreCard[4] && _scoreCard[2])) {
            //console.log(_playerName + " WINS");
            return true;
        }
        return false;
    };

    return {printPlayer, addSelection, checkVictoryConditions, resetPlayer};
};

//module for the game board
const GameBoard = (() => {

    let board = [];
    let _Players = [Player("Player 1"), Player("Player 2")];
    let _playerIndex = 0;

    const _resetGame = () => {
        board = [null, null, null, null, null, null, null, null, null];
        _Players[0].resetPlayer();
        _Players[1].resetPlayer();
    };

    const pickSquare = (index) => {
        if(board[index] == null){
            board[index] = 'x';
            _Players[_playerIndex].addSelection(index);
            if(_Players[_playerIndex].checkVictoryConditions() == true){
                setTimeout( () => {
                    console.log(_Players[_playerIndex].printPlayer() + " WINS");
                    _resetGame();
                    DisplayController.resetBoardDisplay();
                }, 0);
            }
            _playerIndex = (_playerIndex + 1) % 2;
            return _playerIndex;
        }
        else{
            console.log("FUDGE OFF");
            return 2;
        }
    };

    const initGameBoard = () => {};

    const debug_printBoard = () => console.log(board);

    return {debug_printBoard, pickSquare};

})();

//module for controlling display to the DOM
const DisplayController = (() => {

    let _DOM    ;
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
        let pickSquareResult = GameBoard.pickSquare(index);
        let imageforSquare;
        if(pickSquareResult == 0){
            imageforSquare = document.createElement("img");
            imageforSquare.src = _playerOneSelection;
            _squares[index][0].appendChild(imageforSquare);
        }
        else if(pickSquareResult == 1){
            imageforSquare = document.createElement("img");
            imageforSquare.src = _playerTwoSelection;
            _squares[index][0].appendChild(imageforSquare);
        }
        else{
            //do nothing, square was already picked
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
    };


    //creates the radio buttons used in the game setup modal
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


    //function renders the game setup modal.
    //helper function userInput_radioSetup() is used to create radio buttons
    //state variables _playerOneSvgs & _playerTwoSvgs are used
    //state variables _playerOneSelection & _playerTwoSelection are eventually set by submitting the form
    //The following markup is created:
        /*
            <div class="modal">                                     * _modal *
                <h1>Tic-Tac-Toe</h1>
                <form>                                              * _modal.childNodes[1] *
                    <div class = "char-select-wrapper">             * _modal.childNodes[1].firstChild *
                        <div class="radio-char-selection">
                            * radio buttons are created within _userInput_radioSetup() *
                        </div>
                        VS
                        <div class="radio-char-selection">
                            * radio buttons are created within _userInput_radioSetup() *
                        </div>
                    </div>
                    <input class="start-round-btn" type="submit"    * _modal.childNodes[1].childNodes[1] *
                </form>
            </div>
        */
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

    //_submitModal is called when game is started
    //The players selection (index) is stored within the state variables
    //The modal display is disabled, and the board display is enabled
    const _submitModal = () => {
        _playerOneSelection = _playerOneSvgs[document.querySelector('input[name="P1Sel"]:checked').value];
        _playerTwoSelection = _playerTwoSvgs[document.querySelector('input[name="P2Sel"]:checked').value];
        _modal.classList.add("display-disabled");
        _Board.classList.remove("display-disabled");
        return false;
    }

    //Stores the input DOM_selector inside of _DOM state variable
    //  _DOM is where the entire game will reside
    //_Board state variable is filled with a wrapper div and appended to _DOM
    //Game board is rendered
    //Setup modal is rendered
    const initBoardDisplay = (DOM_selector) => {
        _DOM = DOM_selector;
        _Board = document.createElement("div");
        _DOM.appendChild(_Board);
        _renderBoard();
        _renderGameSetupModal();
    };

    const resetBoardDisplay = () => {
        for(let i = 0; i < _squares.length; i++){
            if(_squares[i][0].firstChild){
                _squares[i][0].removeChild(_squares[i][0].firstChild);
            }
        }
        _Board.classList.add("display-disabled");
        _modal.classList.remove("display-disabled");
    }

    return {initBoardDisplay, resetBoardDisplay};

})();




DisplayController.initBoardDisplay(document.querySelector(".game-board-location"));