//factory for player objects
const Player = (ComputerStatus) => {

    let isComputer = ComputerStatus;

    let _scoreCard = [false, false, false, false, false, false, false, false, false];

    const resetPlayer = () => {
        _scoreCard = [false, false, false, false, false, false, false, false, false];
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

            return true;
        }
        return false;
    };

    const isComp = () => {
        return isComputer;
    };

    const takeMove = (currentBoard) => {
        let i;
        for(i = 0; i < currentBoard.length; i++){
            if(currentBoard[i] == null){
                break;
            }
        }
        (document.querySelector(".game-board")).childNodes[i].click();
    };

    return {addSelection, checkVictoryConditions, resetPlayer, isComp, takeMove};
};

//module for the game board
const GameBoard = (() => {

    let board = [null, null, null, null, null, null, null, null, null];
    let _Players
    let _playerIndex = 0;
    let compSpeed = 300;

    const _resetGame = () => {
        board = [null, null, null, null, null, null, null, null, null];
        _Players[0].resetPlayer();
        _Players[1].resetPlayer();
    };

    const _checkForTie = () => {
        return board.includes(null);
    };

    const pickSquare = (index) => {
        if(board[index] == null){
            board[index] = 'x';
            _Players[_playerIndex].addSelection(index);
            if(_Players[_playerIndex].checkVictoryConditions() == true){
                setTimeout( () => {
                    _resetGame();
                    DisplayController.resetBoardDisplay(_playerIndex);
                    _playerIndex = (_playerIndex + 1) % 2;
                }, 0);
            }
            else{
                setTimeout( () => {
                    _playerIndex = (_playerIndex + 1) % 2;
                    if(_Players[_playerIndex].isComp()){
                        setTimeout(() => {
                            _Players[_playerIndex].takeMove(board);
                        }, compSpeed);
                    }
                }, 0);
                setTimeout(() => {
                    if(_checkForTie() == false){
                        _resetGame();
                        DisplayController.resetBoardDisplay(69);
                    }
                }, 0);
            }
            
            return _playerIndex;
        }
        else{
            console.log("FUDGE OFF");
            return 2;
        }
    };

    const initPlayerStatus = (p1, p2) => {
        _Players = [Player(p1), Player(p2)];
        if(_Players[_playerIndex].isComp()){
            setTimeout(() => {
                _Players[_playerIndex].takeMove(board);
            }, compSpeed);
        }
    };


    return {pickSquare, initPlayerStatus};

})();

//module for controlling display to the DOM
const DisplayController = (() => {

    let _DOM;
    let _modal;
    let _Board;
    let _victoryScreen;
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
    let _tieImage = "assets/noun-garbage-5038604.svg";

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
            imageforSquare.classList.add("selection-image");
            imageforSquare.src = _playerOneSelection;
            _squares[index][0].appendChild(imageforSquare);
        }
        else if(pickSquareResult == 1){
            imageforSquare = document.createElement("img");
            imageforSquare.classList.add("selection-image");
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
        _Board.classList.add("opacity-zero");
        _Board.classList.add("display-disabled");
    };

    const _renderVictoryScreen = () => {
        _victoryScreen = document.createElement("div");
        _victoryScreen.classList.add("victory-div");
        _victoryScreen.append(document.createElement("img"));
        _victoryScreen.childNodes[0].classList.add("victory-image");
        _victoryScreen.append(document.createElement("h1"));
        _victoryScreen.childNodes[1].append(document.createTextNode("WINS"));   
        _DOM.appendChild(_victoryScreen);
        _victoryScreen.classList.add("display-disabled");
        _victoryScreen.classList.add("opacity-zero");  
    };

    //modifies the victory screen to either display the corrent winner, or to display a tie
    const _setVictory = (player) => {
        if(player == 0){
            _victoryScreen.childNodes[0].src = _playerOneSelection;
            _victoryScreen.childNodes[1].innerText = "WINS";
        }
        else if(player == 1){
            _victoryScreen.childNodes[0].src = _playerTwoSelection;
            _victoryScreen.childNodes[1].innerText = "WINS";
        }
        else{
            _victoryScreen.childNodes[0].src = _tieImage;
            _victoryScreen.childNodes[1].innerText = "TIE";
        }
        
    }


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
    };

    //creates the computer/human button for the game setup modal
    const _toggleAI_buttonSetup = (name) => {
        let buttonRoot = document.createElement("input");
        buttonRoot.classList.add("human-computer-sel");
        buttonRoot.type = "button";
        buttonRoot.value = "HUMAN";
        buttonRoot.name = name;
        buttonRoot.textContent = "HUMAN";
        buttonRoot.addEventListener('click', (e) =>{
            if(e.target.value == "HUMAN"){
                e.target.value = "COMPUTER";
                e.target.textContent = "COMPUTER";
            }
            else{
                e.target.value = "HUMAN";
                e.target.textContent = "HUMAN";
            }
        });
        return buttonRoot;
    };


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
                        <h2>VS</h2>
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
        _modal.classList.add("opacity-one");    
        _modal.appendChild(document.createElement("h1"));
        _modal.firstChild.appendChild(document.createTextNode("Tic-Tac-Toe"));
        _modal.appendChild(document.createElement("form"));
        _modal.childNodes[1].onsubmit = _submitModal;
        _modal.childNodes[1].appendChild(document.createElement("div"));
        _modal.childNodes[1].firstChild.classList.add("char-select-wrapper")
        _modal.childNodes[1].firstChild.appendChild(document.createElement("div"));
        _modal.childNodes[1].firstChild.childNodes[0].classList.add("player-wrapper");
        _modal.childNodes[1].firstChild.childNodes[0].appendChild(_userInput_radioSetup("P1Sel", _playerOneSvgs));
        _modal.childNodes[1].firstChild.childNodes[0].appendChild(_toggleAI_buttonSetup("P1SelAI"));

        _modal.childNodes[1].firstChild.appendChild(document.createElement("h2"));
        _modal.childNodes[1].firstChild.childNodes[1].appendChild(document.createTextNode("VS"));

        _modal.childNodes[1].firstChild.appendChild(document.createElement("div"));
        _modal.childNodes[1].firstChild.childNodes[2].classList.add("player-wrapper");
        _modal.childNodes[1].firstChild.childNodes[2].appendChild(_userInput_radioSetup("P2Sel", _playerTwoSvgs));
        _modal.childNodes[1].firstChild.childNodes[2].appendChild(_toggleAI_buttonSetup("P2SelAI"));

        _modal.childNodes[1].appendChild(document.createElement("input"));
        _modal.childNodes[1].childNodes[1].type = "submit";
        _modal.childNodes[1].childNodes[1].value = "FIGHT";
        _modal.childNodes[1].childNodes[1].classList.add("start-round-btn");
        _DOM.appendChild(_modal);  
    };

    //_submitModal is called when game is started
    //The players selection (index) is stored within the state variables
    //The modal display is disabled, and the board display is enabled
    const _submitModal = () => {
        _playerOneSelection = _playerOneSvgs[document.querySelector('input[name="P1Sel"]:checked').value];
        _playerTwoSelection = _playerTwoSvgs[document.querySelector('input[name="P2Sel"]:checked').value];

        let p1IsComp = (document.querySelector('input[name="P1SelAI"]').value == "COMPUTER") ? true : false;
        let p2IsComp = (document.querySelector('input[name="P2SelAI"]').value == "COMPUTER") ? true : false;
        GameBoard.initPlayerStatus(p1IsComp, p2IsComp);
        
        _fadeOut(_modal);
        _fadeIn(_Board);    

        return false;
    };

    //Stores the input DOM_selector inside of _DOM state variable
    //  _DOM is where the entire game will reside
    //_Board state variable is filled with a wrapper div and appended to _DOM
    //Game board is rendered and disabled
    //Setup modal is rendered
    //Victory screen is rendered and disabled
    const initBoardDisplay = (DOM_selector) => {
        _DOM = DOM_selector;
        _Board = document.createElement("div");
        _DOM.appendChild(_Board);
        _renderBoard();
        _renderVictoryScreen();
        _renderGameSetupModal();        
    };


    //This function is called by the GameBoard.pickSquare() function when a victory condition is met
    //resetBoardDisplay handles the end of game screen transitions as well as resetting the game 
    const resetBoardDisplay = (player) => {

        _setVictory(player);
        
        setTimeout(() => {
            _fadeOut(_Board);
            _fadeIn(_victoryScreen);
        }, 200)
              
        setTimeout(() => {
            _fadeOut(_victoryScreen);
            _fadeIn(_modal);
        }, 4000);

        setTimeout(() => {
            for(let i = 0; i < _squares.length; i++){
                if(_squares[i][0].firstChild){
                    _squares[i][0].removeChild(_squares[i][0].firstChild);
                }
            }
        }, 4000);
    };

    //This function handles the fadein portion of the screen transitions
    //used on _Modal, _Board, and _victoryScreen DOM objects
    const _fadeIn = (dom_object) => {
        setTimeout(() => {
            dom_object.classList.remove("display-disabled");
            if(dom_object.classList.contains("victory-div")){
                dom_object.classList.add("flex");
            }
            setTimeout(() => {
                dom_object.classList.remove("opacity-zero");
                dom_object.classList.add("opacity-one");
            }, 100);            
        }, 1000);
    };

    //This function handles the fadeout portion of the screen transitions
    //used on _Modal, _Board, and _victoryScreen DOM objects
    const _fadeOut = (dom_object) => {
        dom_object.classList.remove("opacity-one");
        dom_object.classList.add("opacity-zero");
        setTimeout(() => {
            if(dom_object.classList.contains("victory-div")){
                dom_object.classList.remove("flex");
            }
            dom_object.classList.add("display-disabled");
        }, 1000);
    }

    return {initBoardDisplay, resetBoardDisplay};

})();




DisplayController.initBoardDisplay(document.querySelector(".game-board-location"));