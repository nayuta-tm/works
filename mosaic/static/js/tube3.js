let path = "/static/image/" + document.getElementById("path").textContent;
let WIDTH = Number(document.getElementById("width").textContent);
let HEIGHT = Number(document.getElementById("height").textContent);
let answer = document.getElementById("answer").textContent;

let sX = (640 - WIDTH) / 2;
let sY = 480 < HEIGHT ? 0 : (480 - HEIGHT) / 2;

let bgFlag = false;

let mode;

let img;
let isValid = false;
let showA = false;

let $h2 = document.getElementsByTagName("h2")[0];
let $size = document.getElementById("size");
let $score = document.getElementById("score");
let $dc = document.getElementById("dummyCanvas");
let $cv2 = document.getElementById("canvas2");

let h2Default;

//サーチライトモード用
let cg;
let x = 20;
let y = Math.random()*(HEIGHT-30)+30;
let r = 20;
let dx = 0.5;
let dy = 0.25;
let dr = 4;

//ズームアップ用
let sx;
let dsx = 0.2;
let sy;
let dsy = 0.1;
let sw;
let sh;
let rate = 11;
let zoomFlag = true;

//スライス用
let DIVNUM = 25;
let widthSize = WIDTH/DIVNUM;
let heightSize = HEIGHT/DIVNUM;
let slicedImage = [];
let idArr = [];
let candidate = [];

const music = new Audio('/static/music/guess.mp3');
music.volume = 0.6;

music.addEventListener("ended", function(){
  music.currentTime = 0;
  music.play();
}, false);

window.onload = function(){
  $cv2.style.marginLeft = sX + "px";
  $cv2.style.marginTop = sY + "px";
  $dc.style.width = WIDTH + "px";
  $dc.style.height = HEIGHT + "px";
  h2Default = $h2.textContent;
};

let start = function(){
  let selector = document.getElementsByName("mode");
  for(let i=0; i<selector.length; i++){
    if(selector[i].checked){
      mode = selector[i].value;
    }
    if(bgFlag){
      $dc.style.backgroundColor = "transparent";
      $dc.textContent = "";
      bgFlag = false;
    }
  }
  
  isValid = true;
  showA = false;
  if(buffer >= 300){
    music.play();
  }
}

let pause = function(){
  isValid = false;
  if(!bgFlag){
    $dc.style.backgroundColor = "#fafad2";
    $dc.textContent = "一時停止中…";
    bgFlag = true;
  }
  music.pause();
}

document.getElementById("reset").onclick = function(){
  isValid = false;
  background(0);
  mosaic = 50;
  scoreNow = 30;
  buffer = 0;
  fc = 0;
  aRange = 15;
  x = 20;
  y = random(20, HEIGHT-20);
  r = 20;
  dx = 0.5;
  dy = 0.25;
  dr = 5;
  sx = floor(random(0, WIDTH*(1 / (rate -1))));
  sy = floor(random(0, HEIGHT*(1 / (rate -1))));
  dsx = 0.2;
  dsy = 0.1;
  rate = 11;
  zoomFlag = true;
  if(mode === "slice"){
    slicedImage = setSlicedImage(img);
    candidate = idArr;
  }
  music.currentTime = 0;
  music.pause();
  $size.textContent = mosaic;
  $score.textContent = scoreNow;
  $h2.textContent = h2Default;
  if(bgFlag){
    $dc.style.backgroundColor = "transparent";
    $dc.textContent = "";
    bgFlag = false;
  }
};

document.getElementById("show").onclick = function(){
  showA = true;
  music.pause();
  $h2.textContent = "答え: " + answer;
  if(bgFlag){
    $dc.style.backgroundColor = "transparent";
    $dc.textContent = "";
    bgFlag = false;
  }
}

function checkLarger(num, max){
  if(mosaic*(num+1) > max) return max;
  return mosaic*(num+1);
}

function preload(){
  img = loadImage(path)
}

function pointColor(mosaic){
  for(let i=0; i<floor(300 / pow(mosaic, 1.25)); i++){
    let x = random(floor(WIDTH/mosaic));
    let y = random(floor(HEIGHT/mosaic));
    let col = img.get(x*mosaic, y*mosaic);
    noStroke();
    fill(col);
    push();
    translate(x*mosaic, y*mosaic);
    rectMode(CENTER);
    circle(0, 0, mosaic);
    pop();
  }
}

function block(mosaic){
  for(let idy=0; idy<=floor(HEIGHT/mosaic); idy++){
      for(let idx=0; idx<=(WIDTH/mosaic); idx++){
          let _x = random(mosaic*idx, checkLarger(idx, WIDTH));
          let _y = random(mosaic*idy, checkLarger(idy, HEIGHT));
          let col = img.get(_x, _y)
          noStroke();
          fill(red(col), green(col), blue(col), alpha(col));
          rect(mosaic*idx, mosaic*idy, mosaic, mosaic);
      }
  }
}

function gogh(mosaic){
  for(let i=0; i< 100 / pow(mosaic, 1.25); i++){
    let x = int(random(WIDTH));
    let y = int(random(HEIGHT));
    let col = img.get(x, y);
    let h = hue(col);
    let angle = map(h, 0, 255, 0, 90);
    noStroke();
    fill(red(col), green(col), blue(col), 190);
    push();
    translate(x, y);
    rotate(radians(angle));
    rectMode(CENTER);
    rect(0, 0, mosaic*3, mosaic);
    pop();
  }
}

function search(){
  background(0);
  image(img, 0, 0);
  if(x > WIDTH - 10 || x <10){
    if(dx>0){
      dx = -(random(4, 8) / 10);
    }else{
      dx = random(4, 8) / 10;
    }
  }
  if(y > HEIGHT - 10 || y <10){
    if(dy>0){
      dy = -(random(4, 10) / 10);
    }else{
      dy = random(4, 10) / 10;
    }
  }
  cg.background(128);
  cg.erase();
  ellipseMode(CENTER)
  cg.circle(x, y, r, r);
  cg.noErase();
  image(cg, 0, 0);
  x += dx;
  y += dy;
}

function zoom(){
  sw = floor(WIDTH / rate);
  sh = floor(HEIGHT / rate);
  //image(img, dx, dy, dw, dh, sx, sy, sw, sh)
  image(img, 0, 0, WIDTH, HEIGHT, sx, sy, sw, sh);
}

function setSlicedImage(img){
  let sliced = new Array(DIVNUM);
  let buf = new Array(DIVNUM);
  let id = 0;
  let j = 0;

  for(let i=0; i<DIVNUM; i++){
      sliced[i] = new Array(DIVNUM);
      buf[i] = new Array(DIVNUM);
  }

  for(let y=0; y<DIVNUM; y++){
      for(let x=0; x<DIVNUM; x++){
          sliced[y][x] = img.get(widthSize* x, heightSize * y, widthSize, heightSize);
          idArr.push(id);
          id++;
      }
  }

  idArr = shuffle(idArr);
  
  for(let y=0; y<DIVNUM; y++){
      for(let x=0; x<DIVNUM; x++){
          buf[y][x] = sliced[floor(idArr[j] / DIVNUM)][idArr[j] % DIVNUM];
          j++;
      }
  }
  
  return buf;
}

function slice(){
  for(let y=0; y<DIVNUM; y++){
      for(let x=0; x<DIVNUM; x++){
          image(slicedImage[y][x], widthSize*x, heightSize*y, widthSize, heightSize);
      }
  }
}

function replace(){
  let num;
  let targetId;
  let bufimg;
  let bufimg2;
  let bufid;
  num = random(candidate);
  if(num !== idArr[num]){
      targetId = idArr.indexOf(num);
      bufimg = slicedImage[floor(targetId / DIVNUM)][targetId % DIVNUM];
      bufimg2 = slicedImage[floor(num / DIVNUM)][num % DIVNUM];
      slicedImage[floor(num / DIVNUM)][num % DIVNUM] = bufimg;
      slicedImage[floor(targetId / DIVNUM)][targetId % DIVNUM] = bufimg2;
      slice();
      bufid = idArr[num];
      idArr[num] = num;
      idArr[targetId] = bufid;
      candidate = candidate.filter(n => n !== num);
  }
}

function vortex4(aRange, ratio){
  let col;
  let R = WIDTH/2 >= HEIGHT/2 ? WIDTH/2 : HEIGHT/2;
  for(let angle = 0; angle < 360*(60-ratio); angle += 3){
    let radian = radians(angle);
    let distance = floor(angle/360) * R/ratio;
    let x = distance * cos(radian);
    let y = distance * sin(radian);
    ellipseMode(CENTER);
    if(angle % aRange === 0){
      col = img.get(WIDTH/2 + x, HEIGHT/2 + y);
    }
    push();
    translate(WIDTH/2, HEIGHT/2);
    noStroke();
    ellipseMode(CENTER);
    fill(col);
    ellipse(x, y, R/ratio, R/ratio);
    pop();
  }
}

function setup(){
  let canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent("canvas2");
  img.resize(WIDTH, HEIGHT);
  slicedImage = setSlicedImage(img);
  candidate = idArr;
  background(0);
  cg = createGraphics(WIDTH, HEIGHT);
  sx = floor(random(0, WIDTH*(1 / (rate -1))));
  sy = floor(random(HEIGHT*(3/4), HEIGHT));
}

let fc = 0;
let timer = 0;
let aRange = 15;
let mosaic = 50;
let scoreNow = 30;
let buffer = 0;
function draw(){
  if(!showA){
    if(isValid){
      buffer++;
      if(buffer > 300){
        if(mode === "dots"){
          pointColor(mosaic);
        }else if(mode === "blocks"){
          if(fc % 30 === 0){
            block(mosaic);
          }
          fc++;
        }else if(mode === "gogh"){
          gogh(mosaic);
        }else if(mode === "vortex"){
          if(fc % 30 === 0){
            console.log(aRange);
            background(0);
            vortex4(aRange, 30);
            aRange -= 0.125;
            if(aRange <= 1){
              aRange = 1;
            }
          }
          fc++;
        }else if(mode === "search"){
          search();
        }else if(mode === "zoom"){
          zoom();
          if(timer % 360 === 0){
            if(rate >= 5){
              rate -= 1;
            }else if(rate > 2){
              rate -= 0.25
            }else if(rate > 1){
              rate -= 0.5
            }
            if(rate === 1){
              zoomFlag = false;
              isValid = false;
              image(img, 0, 0);
            }
          }
          if(rate !== 1 && zoomFlag){
            sx += dsx;
            sy += dsy;
            if((sx + sw) > WIDTH){
              sx -= 10;
              dsx = -dsx;
            }else if(sx < 0){
              sx += 10;
              dsx = -dsx;
            }else if((sy + sh) > HEIGHT){
              sy -= 10;
              dsy = -dsy;
            }else if(sy < 0){
              sy += 10;
              dsy = -dsy;
            }
          }
        }else if(mode === "slice"){
          if (timer % 10 === 0) replace();
        }
        timer++;
        if(timer % 600 === 0){
          if(mosaic >= 15){
            mosaic -= 10;
          }else{
            mosaic = 5;
          }
          $size.textContent = mosaic;
        }
        if(timer % 120 === 0){
          if(scoreNow >= 1){
            scoreNow--;
          }
          $score.textContent = scoreNow;
        }
        if(mode === "search" && timer % 150 === 0){
          r += dr;
        }
      }else if(buffer <= 300){
        let count = ["5", "4", "3", "2", "1"];
        push();
        fill(0);
        rect(0, 0, WIDTH, HEIGHT);
        textSize(120);
        fill(255);
        text(count[floor(buffer/60)], WIDTH/2-60, HEIGHT/2+30);
        pop();
        if(buffer % 60 === 0){
          background(0);
        }
        if(buffer === 300){
          music.play();
        }
      }
    }
  }else{
     image(img, 0, 0);
  }
}
