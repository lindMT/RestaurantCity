$(document).ready(function(){

    document.getElementById("playButton").addEventListener("click", play);
    document.getElementById("resetButton").addEventListener("click", reset);

    var colorArray = [  "Gray",
                        "Green", "Purple", "Yellow",
                        "Blue", "Red", "Orange"];

    var hexColorArray = [   "#808080",
                            "#00BF63", "#8C52FF", "#DFB300",
                            "#004AAD", "#FF3131", "#FF914D"];

    var currentDice = 0
    var diceNumberArray = [0, 0, 0];
    var diceIdArray = ["dice1", "dice2", "dice3"];                

    function play(){
        document.getElementById("playButton").disabled = true;
        document.getElementById("resetButton").disabled = true;
        reset()
        
        for(i=0; i<3; i++){
            diceNumberArray[i] = Math.floor(Math.random() * 6) + 1;
        }

        // setTimeout(rollDice, 2000);
        rollDice();
    }  

    function rollDice(){
        if (currentDice<3){
            var diceSFX = new Audio('SFX/diceRoll.mp3');
            diceSFX.play();
            document.getElementById(diceIdArray[currentDice]).style.backgroundColor = hexColorArray[diceNumberArray[currentDice]];
            document.getElementById(diceIdArray[currentDice]).innerHTML = colorArray[diceNumberArray[currentDice]];
            currentDice++;
            setTimeout(rollDice, 1500);
        } else{
            checkWin()
        }
    }


    function reset(){
        for(i=0; i<3; i++){
            diceNumberArray[i] = 0;
        }
        currentDice = 0
        document.getElementById("dice1").style.backgroundColor = hexColorArray[0];
        document.getElementById("dice2").style.backgroundColor = hexColorArray[0];
        document.getElementById("dice3").style.backgroundColor = hexColorArray[0];

        document.getElementById("dice1").innerHTML = "";
        document.getElementById("dice2").innerHTML = "";
        document.getElementById("dice3").innerHTML = "";

        document.getElementById("win1").innerHTML = "Winnings: 0x"
        document.getElementById("win2").innerHTML = "Winnings: 0x"
        document.getElementById("win3").innerHTML = "Winnings: 0x"
    }

    function checkWin(){

        for (i=1; i<=3; i++){
            document.getElementById("win" + i).innerHTML = "Winnings: 2x"
        }

        currentDice = 0

        if (diceNumberArray[0] == diceNumberArray[1]){
            document.getElementById("win1").innerHTML = "Winnings: 3x"
            document.getElementById("win2").innerHTML = "Winnings: 3x"
        } else if (diceNumberArray[1] == diceNumberArray[2]){
            document.getElementById("win2").innerHTML = "Winnings: 3x"
            document.getElementById("win3").innerHTML = "Winnings: 3x"
        } else if (diceNumberArray[0] == diceNumberArray[2]){
            document.getElementById("win1").innerHTML = "Winnings: 3x"
            document.getElementById("win3").innerHTML = "Winnings: 3x"
        }

        if(diceNumberArray[0] == diceNumberArray[1] && diceNumberArray[1] == diceNumberArray[2]){
            document.getElementById("win1").innerHTML = "Winnings: 4x"
            document.getElementById("win2").innerHTML = "Winnings: 4x"
            document.getElementById("win3").innerHTML = "Winnings: 4x"
        }
        
        var winnerSFX = new Audio('SFX/winner.mp3');
        winnerSFX.play();
        document.getElementById("playButton").disabled = false;
        document.getElementById("resetButton").disabled = false;

    }

});