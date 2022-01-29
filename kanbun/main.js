let qList = [];

let Q;
let A;

let qCounter = [];

let flag = true;
let toi;

let timer = 0;

let othersArr = [];
let bufArr = [];
let def = "";
let hyouji = "";

let $indicator = document.getElementById("showQuestion");
let $indicator2 = document.getElementById("showAnswer");
let $start = document.getElementById("start");
let $stop = document.getElementById("stop");
let $check = document.getElementById("check");
let $next = document.getElementById("anotherQ");

if(window.File){
    
    let inputFile = document.getElementById("file");
    
    inputFile.addEventListener("change", function(e){
        let fileData = e.target.files[0];
        let reader = new FileReader();

        reader.onerror = function(){
            alert("No such data!");
        }

        reader.onload = function(){
            let dataArray = reader.result.split("\n");
            for(let i = 1; i < dataArray.length - 1; i++){
                qCounter.push(i-1);
                qList[i-1] = dataArray[i].split(",");
            }
        }

        reader.readAsText(fileData);
        
        init();

    }, false); 
    
}

function checkKanji(str){
    let strArr = [...str];
    let checker = [];

    for(let i=0; i<strArr.length; i++){
        if(strArr[i].match(/[\u4e00-\u9fff]/)){
            checker.push(1);
        }else{
            checker.push(0);
        }
    }

    for(let i=0; i<checker.length; i++){
        if(checker[i] == 1){
            bufArr.push(strArr[i]);
        }else{
            othersArr.push(strArr[i]);
            bufArr.push(0);
        }
    }
}

function mainloop(){
    if(flag){
        hyouji = def;
        flag = false;
    }else{
        if(timer >= 25){
            hyouji = "";
            for(let i=0; i<bufArr.length; i++){
                if(bufArr[i] == 0){
                    bufArr[i] = othersArr[0];
                    othersArr.splice(0, 1);
                    break;
                }
            }

            for(let i=0; i<bufArr.length; i++){
                if(bufArr[i] !== 0) hyouji += bufArr[i];
            }
        }
    }
            
    $indicator.innerText = hyouji;
    timer++;
}

function init(){
    flag = true;
    timer = 0;
    othersArr = [];
    bufArr = [];
    def = "";
    hyouji = "";
    $indicator.innerText = "";
    $indicator2.innerText = "";
}

$start.onclick = function(){
    if(flag){
        checkKanji(Q);
        
        for(let i=0; i<bufArr.length; i++){
            if(bufArr[i] !== 0) def += bufArr[i];
        }
    }

    toi = setInterval(mainloop,120);
};

$stop.onclick = function(){
    clearInterval(toi);
}

$check.onclick = function(){
    clearInterval(toi);
    $indicator.innerText = Q;
    $indicator2.innerText = A;
}

$next.onclick = function(){
    init();

    if(qCounter.length > 0){
        let selected;
        selected = Math.floor(Math.random() * qCounter.length);
        Q = qList[qCounter[selected]][0];
        A = qList[qCounter[selected]][1];
        qCounter.splice(selected, 1);
    }else{
        alert("問題のストックがありません");
    }
}
