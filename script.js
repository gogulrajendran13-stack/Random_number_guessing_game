let max = 100;
let randomNumber = Math.floor(Math.random() * max) + 1;

let attempts = 0;
let lives = 10;
let timer = 0;

let best = localStorage.getItem("bestScore");

if(best!=null)
document.getElementById("best").innerHTML = best;

setInterval(function(){

    timer++;

    document.getElementById("timer").innerHTML = timer;

},1000);

function checkGuess(){

    let guess = Number(document.getElementById("guessInput").value);

    if(guess<1 || guess>max){
        message.innerHTML="Enter number between 1 and "+max;
        return;
    }

    attempts++;
    lives--;

    document.getElementById("attempts").innerHTML=attempts;
    document.getElementById("lives").innerHTML=lives;

    document.getElementById("history").innerHTML+=guess+" ";

    document.getElementById("bar").style.width=(lives*10)+"%";

    if(guess==randomNumber){

        message.innerHTML="🎉 YOU WIN!";

        if(best==null || attempts<best){

            localStorage.setItem("bestScore",attempts);

            document.getElementById("best").innerHTML=attempts;

        }

        createConfetti();

    }
    else if(guess<randomNumber){

        message.innerHTML="📉 Too Low";

    }
    else{

        message.innerHTML="📈 Too High";

    }

    if(lives==0){

        message.innerHTML="💀 Game Over! Number was "+randomNumber;

    }

    guessInput.value="";

}

function restartGame(){

    randomNumber=Math.floor(Math.random()*max)+1;
    attempts=0;
    lives=10;
    timer=0;
    document.getElementById("attempts").innerHTML=0;
    document.getElementById("lives").innerHTML=10;
    document.getElementById("timer").innerHTML=0;
    document.getElementById("history").innerHTML="";
    document.getElementById("message").innerHTML="";
    document.getElementById("bar").style.width="100%";
}
function changeDifficulty(){
    max=Number(document.getElementById("difficulty").value);
    restartGame();
}
function toggleTheme(){
    document.body.classList.toggle("dark");
}
function createConfetti(){
    for(let i=0;i<100;i++){
        let c=document.createElement("div");
        //c.innerHTML="🎉";
        c.style.position="fixed";
        c.style.left=Math.random()*100+"%";
        c.style.top="-20px";
        c.style.fontSize="25px";
        document.body.appendChild(c);
        let fall=setInterval(function(){
            c.style.top=(parseInt(c.style.top)+5)+"px";
            if(parseInt(c.style.top)>700){
                clearInterval(fall);
                c.remove();
            }
        },30);
    }
}