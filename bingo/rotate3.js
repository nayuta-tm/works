$(function(){
    var rotor = $("#rotor");
    var roop;
    var count = 0;
    var rotation = 0;
    var bingo = [];
    var random;
    var result;
    var max = 75;
    var move;
    var x = 0;

    $(".show_result").hide();
    $(".result").hide();
    $("#ball").hide();

    for(var i=1; i <= max; i++){
        bingo.push(i);
        $("#number").append($("<li>").text(("0"+i).slice(-2)));
    }

    $(".start").on("click",function(){
        rotor.css("transfrom","rotate("+0+"deg)");
        count = 0;
        rotation = 0;
        x = 0;
        $(this).text("抽選中");
        $(this).css("background","gold");
        $(this).css("color","black");
        $(this).prop("disabled", true);
        $(".result").hide();
        $("#ball").hide();
        $("#ball").css("top","250px");
        $("#ball").css("left","200px");

            roop = setInterval(function(){
                count += 1.8;
                if(count > 360){
                    count = 0;
                    rotation++;
                }else if(rotation >= 1 && count >= 320){
                    clearInterval(roop);
                    $("#ball").show();
                    move = setInterval(function(){
                        x++;
                        $("#ball").css("left", 250-1.5*x+"px");
                        $("#ball").css("top",200+1*x+"px");
                        console.log(x);
                        if(x >= 100){
                            clearInterval(move);
                            $(".start").hide();
                            $(".show_result").show();
                        }
                    },5);
                }else{
                    rotor.css("transform","rotate(" + count + "deg)");
                }
            },1);    
                   
    });

    $(".show_result").on("click",function(){
        $(this).hide();
        $(".start").text("抽選");
        $(".start").css("background","tomato");
        $(".start").css("color","white");
        $(".start").prop("disabled", false);
        $(".start").show();
        $(".result").show();
        $("#ball").hide();
        random = Math.floor(Math.random() * bingo.length);
        result = bingo[random];
        $("#result").text(result);
        bingo.splice(random,1);
        $("#number").find("li").eq(parseInt(result,10)-1).addClass("hit");
    });

});
