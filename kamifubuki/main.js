const NUM = 100;
const COLOURS = ["#f55", "#55f", "#5c5", "#fa5", "#5af"];
const CI = COLOURS.length;

let poster = document.getElementById("poster");
let posterW = poster.clientWidth;
let posterH = poster.clientHeight;

class Kami{
    constructor(){
        this.element = document.createElement("div");
        poster.appendChild(this.element);

        this.x = random(0, posterW);
        this.y = random(0, posterH);

        this.vX = random(-10, 10);
        this.vY = 0;

        this.angle = 0;
        this.speed = random(15, 40);
        this.rX =random(0, 10)/10;
        this.rY = random(0, 10)/10;
        this.rZ = random(0, 10)/10;

        this.element.style.position = "fixed";
        
        this.element.style.width = "20px";
        this.element.style.height = "10px";
        this.element.style.background = COLOURS[random(0, CI-1)];
    }

    update(){
        this.vY = random(5, 10);
        this.x += this.vX;
        this.y += this.vY;
        if(this.y >= posterH){
            this.x = random(0, posterW);
            this.y = -20;
        }
        this.angle = (this.angle + this.speed) % 360;
        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";
        this.element.style.transform = "rotate3D("
                            + this.rX + ","
                            + this.rY + ","
                            + this.rZ + ","
                            + this.angle + "deg)";

    }
}

let kami = [];
for(let i=0; i<NUM; i++){
    kami.push(new Kami());
}


setInterval(mainLoop, 50);

function mainLoop(){
    for(let i=0; i<kami.length; i++){
        kami[i].update();
    }
}


function random(min, max){
    return(Math.floor(Math.random()*(max-min+1)+min));
}
