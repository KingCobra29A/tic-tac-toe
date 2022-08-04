
/****************************** PLAYER **************************************/

//factory for player objects
const Player = (id) => {

    let _playerID = id;
    let _isComputer = false;

    let _scoreCard = [false, false, false, false, false, false, false, false, false];

    const resetPlayer = (compStatus) => {
        _scoreCard = [false, false, false, false, false, false, false, false, false];
        _isComputer = compStatus;
    };


    const addSelection = (index) => {
        _scoreCard[index] = true;
    };

    //Used after each selection is made during GameBoard.pickSquare()
    //returns true if the player has a winning _scoreCard
    //returns false otherwise
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

    //Used during GameBoard.initPlayerStatus() and GameBoard.pickSquare()
    //  to determine if the computers next turn should be scheduled
    //returns true if the player is a computer, and false otherwise
    const isComp = () => {
        return _isComputer;
    };

    //Used by computer players to determine the optimal move, and then take it
    const takeMove = (currentBoard) => {
        let moveIndex;
        let moveScore = -1000;
        let movesLeft = 0;
        //determine current depth of input board
        for(let i = 0; i < 9; i++){
            if (currentBoard[i] == null) movesLeft +=1;
        }
        //calls _minimax() on each possible move to determine index of the best available move
        for(let i = 0; i < 9; i++){
            if(currentBoard[i] == null){
                let tempBoard = currentBoard.slice();
                tempBoard[i] = _playerID;
                let tempScore = _minimax(tempBoard, movesLeft-1, false);
                if(tempScore > moveScore){
                    moveIndex = i;
                    moveScore = tempScore;
                }
            }
        }
        _clickOnSquareAtIndex(moveIndex);
    };

    //helper function for takeMove
    //clicks on the tic-tac-toe square at the input index
    const _clickOnSquareAtIndex = (index) => {
        (document.querySelector(".game-board")).childNodes[index].click();
    };

    //helper function for takeMove
    //decides the optimal square to click on for the AI
    const _minimax = (node, depth, maximizingPlayer) => {
        let nodeValue = _evaluate(node);
        if(depth == 0 || nodeValue != 69){
            return nodeValue;
        }
        if(maximizingPlayer){
            value = -Infinity;
            for(let i = 0; i < 9; i++){
                if(node[i] == null){
                    let tempBoard = node.slice();
                    tempBoard[i] = _playerID;
                    value = Math.max(value, _minimax(tempBoard, depth-1, false));
                }
            }
            return value;
        }
        else{
            value = Infinity;
            for(let i = 0; i < 9; i++){
                if(node[i] == null){
                    let tempBoard = node.slice();
                    tempBoard[i] = (_playerID + 1) % 2;
                    value = Math.min(value, _minimax(tempBoard, depth-1, true));
                }
            }
            return value;
        }
    };


    //helper function for _minimax
    //returns the heuristic value of the input game board
    const _evaluate = (inputBoard) => {
        //row condition
        for(let i = 0; i < 9;){
            if((inputBoard[i] != null) && (inputBoard[i] == inputBoard[i+1]) && (inputBoard[i] == inputBoard[i+2])){
                return (inputBoard[i] == _playerID) ? 10 : -10;
            }
            i = i + 3;
        }
        //column condition
        for(let i = 0; i < 3; i++){
            if((inputBoard[i] != null) && (inputBoard[i] == inputBoard[i+3]) && (inputBoard[i] == inputBoard[i+6])){
                return (inputBoard[i] == _playerID) ? 10 : -10;
            }
        }
        //diag condition (top down)
        if((inputBoard[0] != null) && (inputBoard[0] == inputBoard[4]) && (inputBoard[0] == inputBoard[8])){
            return (inputBoard[0] == _playerID) ? 10 : -10;
        }
        //diag condition (bottom up)
        if((inputBoard[6] != null) && (inputBoard[6] == inputBoard[4]) && (inputBoard[6] == inputBoard[2])){
            return (inputBoard[6] == _playerID) ? 10 : -10;
        }
        //tie condition
        if(!inputBoard.includes(null)){
            return 0;
        }
        //board has not yet reached a win/loss/tie
        return 69;
    };


    return {addSelection, checkVictoryConditions, resetPlayer, isComp, takeMove};
};



/****************************** GAME BOARD **************************************/


//module for the game board
const GameBoard = (() => {

    let board = [null, null, null, null, null, null, null, null, null];
    let _Players = [Player(0), Player(1)];
    let _playerIndex = 0;
    let _compSpeed = 1000;
    let _disableMoves = false;

    //reset both players and gameboard
    const _resetGame = () => {
        board = [null, null, null, null, null, null, null, null, null];
        _Players[0].resetPlayer(false);
        _Players[1].resetPlayer(false);
    };

    //returns true if there are no more valid moves available
    const _checkForTie = () => {
        return !board.includes(null);
    };

    //This function is used by the event listeners on each square
    //Returns _playerIndex (0 or 1) if the move was valid
    //Returns 2 if the move was invalid
    const pickSquare = (index) => {
        //Move was invalid (it is not a human players turn, but was clicked by human)
        if(_disableMoves){
            return 2;
        }
        //it is a human players turn, and the square is not already taken
        else if(board[index] == null){
            //add the selection to the board and the players score card
            board[index] = _playerIndex;
            _Players[_playerIndex].addSelection(index);
            //check to see if the move resulted in a victory
            if(_Players[_playerIndex].checkVictoryConditions() == true){
                //the player won, prevent any further moves
                _disableMoves = true;
                //setTimeout 0, so that the display controller can change the DOM before we reset the game
                setTimeout( () => {
                    //reset gameboard and players
                    _resetGame();
                    //initiate end of game display sequence + reset
                    DisplayController.resetBoardDisplay(_playerIndex);
                    _playerIndex = (_playerIndex + 1) % 2;
                }, 0);
            }
            //move did not result in a victory condition
            else{
                //setTimeout 0, so that the display controller can change the DOM before we check for a tie / continue
                setTimeout(() => {
                    if(_checkForTie() == true){
                        _disableMoves = true;
                        _resetGame();
                        DisplayController.resetBoardDisplay(69);
                        _playerIndex = (_playerIndex + 1) % 2;
                    }
                    else{
                        //start the next players turn
                        _playerIndex = (_playerIndex + 1) % 2;
                        //if the current player is a computer, schedule the computers next turn
                        if(_Players[_playerIndex].isComp()){
                            _disableMoves = true;
                            setTimeout(() => {
                                _disableMoves = false;
                                _Players[_playerIndex].takeMove(board);
                            }, _compSpeed);
                        }
                    }
                }, 0);
            }
            
            return _playerIndex;
        }
        //Move was invalid (already taken)
        else{
            return 2;
        }
    };

    //Used by DisplayController._submitModal()
    //Resets both players & sets the players' computer status
    //if player 0 is a computer, their first move is scheduled
    const initPlayerStatus = (p1, p2) => {
        _Players[0].resetPlayer(p1);
        _Players[1].resetPlayer(p2);
        _disableMoves = false;
        if(_Players[_playerIndex].isComp()){
            _disableMoves = true;
            setTimeout(() => {
                _disableMoves = false;
                _Players[_playerIndex].takeMove(board);
            }, _compSpeed * 2);
        }
    };


    return {pickSquare, initPlayerStatus};

})();



/****************************** DISPLAY CONTROLLER **************************************/


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
    //applies click-based event listeners on each square, which call _toggleSquare
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

    //Called once initBoardDisplay to generate the html + apply css for the victory screen
    //The following markup is created:
    //<div class="victory-div">
    //      <img class="victory-image">
    //          //Victory image src is set later by _setVictory()
    //      </img>
    //      <h1>
    //          // either "WINS" or "TIE", set later by _seVictory()
    //      </h1>
    //</div>
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
    //is called twice during _renderGameSetupModal()
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
    //is called twice during _renderGameSetupModal()
    //adds an eventlistener to the button to toggle between the states "HUMAN" & "COMPUTER"    
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