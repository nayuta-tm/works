$(function(){

    const slotContents =[
        [
            ["一点獲得"],
            ["二点獲得"],
            ["三点獲得"],
            ["四点獲得"]
        ],　//お堅い神社
        [
            ["失敗", "失敗","失敗","失敗","失敗","失敗","失敗","失敗","五点獲得","五点獲得"],
            ["失敗", "失敗","失敗","失敗","失敗","失敗","失敗","六点獲得","七点獲得","七点獲得"],
            ["失敗", "失敗","失敗","失敗","失敗","失敗","七点獲得","七点獲得","八点獲得","八点獲得"],
            ["失敗","八点獲得"],

        ],  //一発逆転神社
        [
            ["一点強奪", "一点強奪", "一点強奪", "一点強奪", "二点強奪", "二点強奪", "凶 一点減点", "凶 一点減点", "凶 二点減点", "凶 二点減点"],
            ["一点強奪", "二点強奪", "二点強奪", "二点強奪", "二点強奪", "二点強奪", "二点強奪", "凶 二点減点", "凶 二点減点", "凶 二点減点"],
            ["三点強奪", "二点強奪", "二点強奪", "二点強奪", "二点強奪", "二点強奪", "二点強奪", "二点強奪", "凶 二点減点", "凶 二点減点"],
            ["三点強奪", "三点強奪", "三点強奪", "二点強奪", "二点強奪", "二点強奪", "二点強奪", "二点強奪", "二点強奪", "凶 二点減点"],
        ]  //呪いの神社
    ];
    const getScore = [
        [
            [1],
            [2],
            [3],
            [4]
        ],  //お堅い神社
        [
            [0,0,0,0,0,0,0,0,5,5],
            [0,0,0,0,0,0,0,6,7,7],
            [0,0,0,0,0,0,7,7,8,8],
            [0,8]
        ],  //一発逆転神社
        [
            ["1_d","1_d","1_d","1_d","2_d","2_d","1_s","1_s","2_s","2_s"],
            ["1_d","2_d","2_d","2_d","2_d","2_d","2_d","2_s","2_s","2_s"],
            ["3_d","2_d","2_d","2_d","2_d","2_d","2_d","2_d","2_s","2_s"],
            ["3_d","3_d","3_d","2_d","2_d","2_d","2_d","2_d","2_d","2_s"]
        ]  //呪いの神社
    ];
    const COLOURS = ["#f55", "#55f", "#5c5", "#fa5", "#0bf", "#f6b"];

    const knock = new Audio("knock.mp3");

    let tokenPos = [];  //所持トークン数
    let score = [];     //Scoreクラスで作ったインスタンスを格納
    let tokenVis = [];  //Tokenクラスで作ったインスタンスを格納
    let tbox = [];      //TBoxクラスで作ったインスタンスを格納
    let currentP = [];  //PlayerVisクラス

    let activePlayer;     //プレイヤーIDを格納
    let absentCount = []; //休みをカウント
    let scoreArr = [];    //所持ポイント
    let acP = [];         //解答権のあるプレイヤー

    let mode = "";
    let dFlag = false;
    let selectFlag = true;
    let cursedPlayer;
    let drainP;
    let curseLetter;
    let curseResult;

    class Score{
        constructor(i){
            $('#score').append("<div id=" +  String(i) + " class='score_board unselected'></div>");
            $('.score_board').on('click', (e) => trigger(e));
        }

        colourize(i){
            $('.score_board').eq(i).css('background-color', COLOURS[i]);
        }

        update(i){
            $('.score_board').eq(i).text(String(scoreArr[i]));
        }
    }

    class TBox{
        constructor(){
            $('#amount').append("<div class='box_wrap'><div class='show_amount'>0</div><button class='countup'>加</button><button class='countdown'>減</button></div>");
            $('.countup').prop('disabled', true);
            $('.countdown').prop('disabled', true);
        }
    }

    class Token{
        constructor(){
            $('#token').append("<div class='token_vis'><div class='ofuda'></div><span class='vis'></span></div>");
            $('.vis').text("×0枚");
        }

        update(i){
            $('.vis').eq(i).text("×" + String(tokenPos[i]) + "枚");
        }
    }

    class PlayerVis{
        constructor(){
            $('#current_p').append("<div class='showP'><p class='acP active'>天</p><p class='acP inactive'>地</p><p class='acP inactive'>人</p></div>");
        }

        update(i){
            for(let j=0; j<3; j++){
                if(j === acP[i]){
                    $('.showP').eq(i).children().eq(j).attr('class', 'acP active');
                }else{
                    $('.showP').eq(i).children().eq(j).attr('class', 'acP inactive');
                }
            }
        }
    }

    $('.praybutton').prop('disabled', true);

    $('#teamup').on('click',() =>{
        let teamN = Number($('#team_n').text());
        if(teamN <= 5){
            teamN += 1;
        }
        $('#team_n').text(teamN);
    });

    $('#teamdown').on('click',() =>{
        let teamN = Number($('#team_n').text());
        if(teamN >= 2){
            teamN -= 1;
        }
        $('#team_n').text(teamN);
    });
    
    $('#correct').on('click', () => {
        selectFlag = false;

        if(activePlayer !== ""){
            changeTokenPos(activePlayer,1);
            tokenVis[activePlayer].update(activePlayer);
            //countUp();
            //checkAbsent();
            $('.praybutton').css("visibility", "visible");
            $('#correct').css("visibility", "hidden");
            $('#wrong').css("visibility", "hidden");
            //$('.config').css("visibility", "hidden");
            $('.countup').eq(activePlayer).prop('disabled', false);
            $('.countdown').eq(activePlayer).prop('disabled', false);
            //changeActivePlayer();
        }
    });

    $('#wrong').on("click", () => {
        if(activePlayer !== ""){
            const $sb = $('.score_board');
            //countUp();
            //checkAbsent();
    
            //$sb.eq(activePlayer).css("visibility", "hidden");
            $sb.eq(activePlayer).attr("class", "score_board absent");
            absentCount[activePlayer] = -3;
    
            //chooseUniquePlayer();
            //changeActivePlayer();

        }
    })

    $('#thru').on("click", () => {
        checkAbsent();
        chooseUniquePlayer();
        
        const $sb = $('.score_board');

        let ac = 0;
        for(let i=0; i<absentCount.length; i++){
            if(absentCount[i] < 0){
                ac += 1;
            }
        }

        if(ac == absentCount.length){
            checkAbsent();
        }else{
            countUp();
        }
        
        
        
        changeActivePlayer();
    })
    
    $('#next').on("click", () => {
        toggleVisual();
        $('.countup').prop('disabled', true);
        $('.countdown').prop('disabled', true);
    })

    $('#g_start').on('click', () => {
        const teamNum = Number($('#team_n').text());
        activePlayer = "";
        $('#score').empty();
        $('#token').empty();
        $('#amount').empty();
        $('.praybutton').css("visibility", "hidden");
        for(let i=0; i<teamNum; i++){
            score.push(new Score(i));
            score[i].colourize(i);
            tokenVis.push(new Token);
            tokenPos.push(0);
            tbox.push(new TBox);
            absentCount.push(0);
            scoreArr.push(0);
            score[i].update(i);
            currentP.push(new PlayerVis);
            acP.push(0);
        }
        for(let i=0; i<teamNum; i++){
            $('.countup').eq(i).on('click',() => {
                let num = Number($('.show_amount').eq(i).text());
                if(num+1 <= tokenPos[i]){
                    num += 1;
                }
                $('.show_amount').eq(i).text(num);
            })
        }
    
        for(let i=0; i<teamNum; i++){
            $('.countdown').eq(i).on('click',() => {
                let num = Number($('.show_amount').eq(i).text());
                if(num >= 1){
                    num -= 1;
                }
                $('.show_amount').eq(i).text(num);
            })
        }
        $('#g_start').prop('disabled', true);
        $('.praybutton').prop('disabled', false);
    })

    $('#normal').on('click', () => {
        useToken(activePlayer, 0);
    })

    $('#gambling').on('click', () => {
        useToken(activePlayer, 1);
    })

    $('#curse').on('click', () => {
        useToken(activePlayer, 2);
    })
    
    function random(max){
        return(Math.floor(Math.random()*max));
    }

    function chooseUniquePlayer(){
        const $sel = $('.selected');
        if($sel){
            for(let i=0; i<$sel.length; i++){
                $sel.eq(i).attr("class","score_board unselected");
            }
            activePlayer = "";
        }
        selectFlag = true;
    }

    function countUp(){
        let qCounter = Number($('#q_count').text());
        qCounter += 1;
        $('#q_count').text(qCounter);
    }

    function changeTokenPos(i,j){
        tokenPos[i] += j;
    }

    function trigger(e){
        const $target = e.currentTarget;
        
        if(mode === "" && dFlag === false && selectFlag === true){
            if($target.className !== "score_board absent"){
                chooseUniquePlayer();
                $target.className = "score_board selected";
                activePlayer = Number($target.id);
            }
        }else if(mode === "curse"){
            $target.className = "score_board cursed";
            cursedPlayer = Number($target.id);
            drain(activePlayer, cursedPlayer, drainP, curseLetter);
            mode = "";
            $('#curse_balloon').css('display', 'none');
        }

    }

    function checkAbsent(){
        const $sb = $(".score_board");
        
        for(let i=0; i<absentCount.length; i++){
            if(absentCount[i] < 0){
                absentCount[i] += 1;
                if(absentCount[i] == 0){
                    //$sb.eq(i).css("visibility", "visible");
                    $sb.eq(i).attr("class", "score_board unselected");
                }
            }
        }
    }

    function toggleVisual(){
        $('.config').css("visibility", "visible");
        $('.praybutton').css("visibility", "hidden");
        chooseUniquePlayer();
    }

    function useToken(i, slotId){
        let tokenNum = Number($('.show_amount').eq(i).text());
        if(tokenNum <= tokenPos[i]){
            changeTokenPos(i, tokenNum*(-1));
            tokenVis[i].update(i);
            doSlot(slotId, tokenNum);
        }else{
            alert("入力が正しくありません");
        }
        $('.show_amount').eq(i).text(0);
        $('.countup').prop('disabled', true);
        $('.countdown').prop('disabled', true);
        selectFlag = true;
    }

    function changeActivePlayer(){
        for(let i=0; i<acP.length; i++){
            if(absentCount[i] == 0){
                acP[i] += 1;
                if(acP[i] > 2){
                    acP[i] = 0;
                }
            }
            currentP[i].update(i);
        }
    }

    function doSlot(slotId, tokenUsed){
        let result = random(slotContents[slotId][tokenUsed -1].length);
        let gimmick;
        let rT = 5;
        let gT = 19;
        let bT = 21;
        const R = 217;
        const G = 66;
        const B = 54;
        let cR = R;
        let cG = G;
        let cB = B;

        if(slotId !== 2){
            $('#resultviewer').css("color", "black");
            opener();
            if(slotId === 1){
                $('#gamble_balloon').css('display', 'block');
            }
            gimmick = setInterval(() => {
                $('#resultviewer').css("background-color", "rgb(" + cR + "," + cG + "," + cB + ")");
                cR = checkSmaller(cR + rT);
                cG = checkSmaller(cG + gT);
                cB = checkSmaller(cB + bT);
                if(cR == 255 && cG == 255 && cB == 255){
                    clearInterval(gimmick);
                    $('#resultviewer').text(slotContents[slotId][tokenUsed -1][result]);
                    setTimeout(() => {
                            if(slotId === 1){
                                if(slotContents[slotId][tokenUsed -1][result] === "失敗"){
                                    $('#gamble_balloon').text("掬われる");
                                }else{
                                    $('#gamble_balloon').text("救われる");
                                }
                            }
                    },400);
                }
            }, 100);
            
            setTimeout(() => {
                scoreArr[activePlayer] += getScore[slotId][tokenUsed -1][result];
                score[activePlayer].update(activePlayer);
                $('#resultviewer').text("");
                chooseUniquePlayer();
                initColour();
                toggleVisual();
                $('#gamble_balloon').text("信じる者は…");
                $('#gamble_balloon').css('display', 'none');
            },4000);       
        }else if(slotId === 2){
            let curseWord = getScore[slotId][tokenUsed-1][result];   
            
            $('#resultviewer').css("color", "crimson");
            curseResult = slotContents[slotId][tokenUsed-1][result];
            mode = "curse";
            drainP = Number(curseWord.split('_')[0]);
            curseLetter = curseWord.split('_')[1];
            dFlag = true;
            $('#curse_balloon').css('display', 'block');
        }
    }

    function initColour(){
        $('#resultviewer').css("background-color", "rgb(217, 66, 54)");
    }

    function checkSmaller(item){
        let smaller = (item >= 255) ? 255 : item;
        return smaller;
    }

    function drain(active, target, num, curseLetter){
        let gimmick;
        let rT = 5;
        let gT = 19;
        let bT = 21;
        const R = 217;
        const G = 66;
        const B = 54;
        let cR = R;
        let cG = G;
        let cB = B;
        
        opener();
        gimmick = setInterval(() => {
            $('#resultviewer').css("background-color", "rgb(" + cR + "," + cG + "," + cB + ")");
            cR = checkSmaller(cR + rT);
            cG = checkSmaller(cG + gT);
            cB = checkSmaller(cB + bT);
            if(cR == 255 && cG == 255 && cB == 255){
                clearInterval(gimmick);
                $('#resultviewer').text(curseResult);
            }
        }, 100);
        
        setTimeout(() => {
            if(curseLetter == "d"){
                scoreArr[active] += num;
                scoreArr[target] -= num;
            }else if(curseLetter == "s"){
                scoreArr[active] -= num;
            }
            for(let i=0; i<scoreArr.length; i++){
                score[i].update(i);
            }
            if(absentCount[target]<0){
                $('.cursed').eq(0).attr('class', 'score_board absent');
            }else{
                $('.cursed').eq(0).attr('class', 'score_board unselected');
            }
            chooseUniquePlayer();
            drainP = "";
            dFlag = false;
            $('#resultviewer').text("");
            initColour();
            toggleVisual();
        },3000)
    }

    function opener(){
        knock.volume = 0.7;
        knock.currentTime = 0;
        knock.play();
    }

});