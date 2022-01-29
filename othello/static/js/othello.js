$(function () {
    const cnvs = $("#cnvs");
    if (ww < 600) {
		$("body").css("fontSize", 20 * ww / 600 + "px");
		$(".cpubtn").css("fontSize", "1em");
		$(".startbtn").css("fontSize", 30 * 0.8 * ww / 600 + "px");
        $("#cnvs").attr("width", ww);
        $("#cnvs").attr("height", ww);
		$("#levelbox").width(ww);
		$("#levelbox").height(ww);
    }
    cnvs.css("background-color", "darkgreen");
	
	$(".startbtn").show();
    const TURN = {
        NONE: 0,
        BLACK: 1,
        WHITE: 2
    };

    class GUI {
        constructor(Nsize, width, maneger) {
            this.Nsize = Nsize;
            this.width = width;
            this.cellsize = width / (Nsize + 1);
            this.mouse = { x: 0, y: 0 };
            this.Imouse = { xi: -1, yi: -1 };
            this.busy = false;
            this.ctx = cnvs[0].getContext("2d");
            this.maneger = maneger;
			this.thinking = false;
        }

        showSimulation(results) {
            let ctx = this.ctx;
            ctx.fillStyle = "red";
            ctx.textAlign = "center";
            ctx.font = "100px sans-serif";
            ctx.fillText(results, this.width / 2, this.width / 2, 1000);
        }

        DrawBoard(board) {
            let ctx = this.ctx;

            
            //clear board
            this.ctx.clearRect(0, 0, this.width, this.width);
            //draw empty board
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            for (let i = 0; i <= this.Nsize; i++) {
                ctx.moveTo(this.cellsize * (i + 1 / 2), this.cellsize / 2);
                ctx.lineTo(this.cellsize * (i + 1 / 2), this.cellsize * (this.Nsize + 1 / 2));
                ctx.moveTo(this.cellsize / 2, this.cellsize * (i + 1 / 2));
                ctx.lineTo(this.cellsize * (this.Nsize + 1 / 2), this.cellsize * (i + 1 / 2));
            }
            ctx.closePath();
            ctx.stroke();

            //ボードの位置を記載
            ctx.textAlign = "center";
            ctx.fillStyle = "yellow";
            ctx.font = "20px sans-serif";
            const rows = ["a", "b", "c", "d", "e", "f", "g", "h"];
            const columns = [1,2,3,4,5,6,7,8];
            for(let i=0; i< this.Nsize; i++){
                ctx.fillText(rows[i], this.cellsize/4, this.cellsize*(i + 1));
                ctx.fillText(columns[i], this.cellsize*(i + 1), this.cellsize/3);
            }
			
			if(this.maneger.lastte != null && this.maneger.gameChu){
				let xi = this.maneger.lastte[0];
				let yi = this.maneger.lastte[1];
				ctx.rect(this.cellsize + (xi - 1/2) * this.cellsize + 1,
						 this.cellsize + (yi - 1/2) * this.cellsize + 1,
						 this.cellsize - 2,
						 this.cellsize - 2
						 )
				ctx.fillStyle = "rgba(128, 128, 128, 0.8)";
				ctx.fill();
						 
			}
            // draw discs
            for (let xi = 0; xi < this.Nsize; xi++) {
                for (let yi = 0; yi < this.Nsize; yi++) {
                    if (board[yi][xi] != TURN.NONE) {
                        ctx.beginPath();
                        ctx.arc(
                            this.cellsize + xi * this.cellsize,
                            this.cellsize + yi * this.cellsize,
                            this.cellsize * 0.4,
                            0,
                            Math.PI * 2,
                            true
                        );
                        if (board[yi][xi] == TURN.BLACK) {
                            ctx.fillStyle = "black";
                        } else {
                            ctx.fillStyle = "white";
                        }
                        ctx.fill();
                    }
                }
            }

            for (let arr of this.maneger.get_okeru()) {
                let xi = arr[0]; let yi = arr[1];
                ctx.beginPath();
                ctx.arc(
                    this.cellsize + xi * this.cellsize,
                    this.cellsize + yi * this.cellsize,
                    this.cellsize * 0.1,
                    0,
                    Math.PI * 2,
                    true
                );
				if(this.maneger.game.turn == TURN.BLACK) ctx.fillStyle = "#303030";
				if(this.maneger.game.turn == TURN.WHITE) ctx.fillStyle = "#b0b0b0";
                
                ctx.fill();
            }

            if (this.passtimer > 0) {
                let ss = "";
                if (this.passturn == TURN.BLACK) ss = "黒";
                if (this.passturn == TURN.WHITE) ss = "白";
                let ctx = this.ctx;
                ctx.fillStyle = "red";
                ctx.textAlign = "center";
                ctx.font = "50px sans-serif";
                ctx.fillText(ss + "：　パス", this.width / 2, this.width / 2, 1000);
                this.passtimer -= 1;
            }

            if (this.finishtimer > 0) {
                let ss = "引き分け！";
                if (this.finishResult == TURN.BLACK) ss = "黒の勝利！";
                if (this.finishResult == TURN.WHITE) ss = "白の勝利！";

                let ctx = this.ctx;
                ctx.fillStyle = "red";
                ctx.textAlign = "center";
                ctx.font = "50px sans-serif";
                ctx.fillText(ss, this.width / 2, this.width / 2, 1000);
                this.finishtimer -= 1;
            }
			if (this.thinking){
                let ss = "思考中...";
                let ctx = this.ctx;
                ctx.fillStyle = "grey";
                ctx.textAlign = "center";
                ctx.font = "50px sans-serif";
                ctx.fillText(ss, this.width / 2, this.width / 2, 1000);
			}
        }

        showPass(turn) {
            this.passtimer = 10;
            this.passturn = turn;
        }
		showThinking(){
			this.thinking = true;
		}
        showFinishMessege(result) {
            this.passtimer = 0;
            this.finishtimer = 45;
            this.finishResult = result;
        }
        update(mouse) {
            this.update_mouse(mouse);
			this.click();
        }
		click(){
			if(!clicked) return;
			if (0 <= this.Imouse.xi
				& this.Imouse.xi < this.Nsize & 0 <= this.Imouse.yi & this.Imouse.yi < this.Nsize) {
				// ボードの中でクリックされたとき
				this.maneger.get_hand_from_gui(this.Imouse);
			}
			clicked = false;
		}
        update_mouse(mouse) {
            this.mouse.x = mouse.x;
            this.mouse.y = mouse.y;
            let xi = parseInt((this.mouse.x - this.cellsize / 2) / this.cellsize);
            let yi = parseInt((this.mouse.y - this.cellsize / 2) / this.cellsize);
            this.Imouse.xi = xi;
            this.Imouse.yi = yi;
        }

    }

    class OthelloController {
        constructor(Nsize, width) {
            this.Nsize = Nsize;
            this.gui = new GUI(Nsize, width, this);
            this.game = new Othello(Nsize);
            this.gameChu = false;
            this.waiting = false;
            this.okeru = [];
            this.passed = false;
            this.simulating = false;
        }
        update(mouse) {
            this.gui.update(mouse);
            this.gui.DrawBoard(this.game.board);
            let ncolors = this.game.count_colors();
            $('#indicator').text(`黒${ncolors["BLACK"]}-白${ncolors["WHITE"]}`);
            clicked = false;
        }
        start() {
			$("#levelbox").hide();
            $(".startbtn").hide();
			$(".cpubtn").hide();
			$("#back").show();
            $("#cnvs").removeClass("w3-opacity");

            this.update_to_next();
        }
        start_human() {
            this.gameChu = true;
            this.game = new Othello(this.Nsize);
            this.game.players.push(new Player());
            this.game.players.push(new Player());
            this.start();
        }
        start_cpu(num, val) {
            this.gameChu = true;
            this.game = new Othello(this.Nsize);

            if(num == 1){   
                this.game.players.push(new Player());
                this.game.players.push(new CPUMonteCarloEval(this.game, val, 30, 5, 0.4));
            }else if(num ==2){
                this.game.players.push(new CPUMonteCarloEval(this.game, val, 30, 5, 0.4));
                this.game.players.push(new Player());
            }

            this.start();
        }
        get_hand_from_gui(Imouse) {
            // マスをクリックしたときにGUIから呼ばれる関数。
            if (!this.gameChu) return;
            
            if (this.game.players[this.game.turn - 1].ishuman) {

                if (this.game.check_okeru(Imouse.xi, Imouse.yi)) {
                    // クリックしたところが合法手なら石をひっくり返す
                    this.game.put_disc(Imouse);
                    this.update_to_next();
					this.lastte = [Imouse.xi, Imouse.yi];
                }
            }
        }
        update_to_next() {
            // 石をひっくり返したあとの処理を色々する。（okeruの更新）
			if(!this.gameChu) return;
            this.game.refresh_okeru();

            if (this.game.okeru.length == 0) {
                // 合法手がないとき。

                this.gui.showPass(this.game.turn);
                this.game.turn = 3 - this.game.turn;
                this.game.refresh_okeru();
                if (this.game.okeru.length == 0) {
                    // パスが二回続いたとき終了する。
                    this.finish();
                    return;
                }
                this.update_to_next();
            } else {
                //合法手があるとき、CPUなら手を考える。
                let player = this.game.players[this.game.turn - 1];
                
                if (player.iscpu) {
					function Temp(maneger, player){
						let te = player.think();
						maneger.game.put_disc({ xi: te[0], yi: te[1] });
						maneger.update_to_next();
						maneger.gui.thinking = false;
						maneger.updateData();
						maneger.lastte = te;
					}
					this.gui.showThinking();
					setTimeout(Temp, 300, this, player);
                }
            }
            // 終了してるか？
            if (this.game.isover()) {
                this.finish();
            }
        }

        //ここで評価値を示したグラフを更新している
		updateData(){
			let datasets = [];
			let colors = ["PINK", window.chartColors.red, window.chartColors.blue];
			let labels = ["None", "CPU（黒）", "CPU（白）"];
			for(let i=0; i<this.game.players.length; i++){
				let player = this.game.players[i];
				if(player.iscpu){
					if(player.has_value_history == null) continue;
					let value_history = player.value_history;
					if(i+1 == TURN.WHITE){
						value_history = [];
						for(let j=0; j<player.value_history.length; j++){
							value_history[j] = - player.value_history[j];
						}
					}
					let points = [];
					for(let j=0; j<value_history.length; j++){
						let offset = 1;
						if(i+1 == TURN.WHITE) offset = 2;
						points.push({x: 2*j + offset, y: value_history[j]});
					}
					let data = {
						label: labels[i + 1],
						data: points,
						borderColor: colors[i + 1],
						backgroundColor: colors[i + 1],
						borderWidth: 1,
						fill: false,
					};
					datasets.push(data);
				}
			}
			myChart.data.datasets = datasets;
			myChart.update();
		}
        finish() {
            let ncolors = this.game.count_colors();
            let result = TURN.NONE;
            if (ncolors["BLACK"] > ncolors["WHITE"]) result = TURN.BLACK;
            if (ncolors["BLACK"] < ncolors["WHITE"]) result = TURN.WHITE;
            $("#cnvs").addClass("w3-opacity");
            this.gui.showFinishMessege(result);
            this.gameChu = false;
        }
        get_okeru() {
            return this.game.okeru;
        }
    }

    class Othello {
        constructor(Nsize) {
            this.Nsize = Nsize;
            this.SetInitBoard();
            this.players = [];
            this.turn = 1; // 1: 黒番, 2: 白番

            this.okeru = [];
            for (let yi = 0; yi < this.Nsize; yi++) {
                for (let xi = 0; xi < this.Nsize; xi++) {
                    if (this.check_okeru(xi, yi)) {
                        this.okeru.push([xi, yi]);
                    }
                }
            }
        }

        SetInitBoard() {
            this.board = [];
            for (let i = 0; i < this.Nsize; i++) {
                this.board[i] = [];
                for (let j = 0; j < this.Nsize; j++) {
                    this.board[i][j] = TURN.NONE;
                }
            }
            this.board[this.Nsize / 2 - 1][this.Nsize / 2 - 1] = TURN.WHITE;
            this.board[this.Nsize / 2][this.Nsize / 2] = TURN.WHITE;
            this.board[this.Nsize / 2 - 1][this.Nsize / 2] = TURN.BLACK;
            this.board[this.Nsize / 2][this.Nsize / 2 - 1] = TURN.BLACK;
        }
        put_disc(Imouse) {
            // 合法手か判定したあとに呼ぶ。ひっくり返し、手番を交代する。
            // ひっくり返した石を配列で返す
            let xi = Imouse.xi;
            let yi = Imouse.yi;
            let ds = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
            for (let d of ds) {
                let _xi = xi; let _yi = yi;
                let dx = d[0]; let dy = d[1];
                _xi += dx; _yi += dy;
                let flag_temp = false;
                while (this.in_board(_xi, _yi)) {
                    if (this.board[_yi][_xi] == 3 - this.turn) {
                        _xi += dx; _yi += dy;
                        flag_temp = true;
                    } else {
                        break;
                    }
                }
                if (!this.in_board(_xi, _yi)) continue;
                if (flag_temp & this.board[_yi][_xi] == this.turn) {
                    while ((_xi != xi) || (_yi != yi)) {
                        this.board[_yi][_xi] = this.turn;
                        _xi -= dx; _yi -= dy;
                    }
                    this.board[_yi][_xi] = this.turn;

                }
            }
            this.turn = 3 - this.turn;
        }
        refresh_okeru() {
            this.okeru = [];
            for (let yi = 0; yi < this.Nsize; yi++) {
                for (let xi = 0; xi < this.Nsize; xi++) {
                    if (this.check_okeru(xi, yi)) {
                        this.okeru.push([xi, yi]);
                    }
                }
            }
        }
        check_okeru(xi, yi) {
            return this.check_okeru_from(this.board, this.turn, xi, yi);
        }
        in_board(xi, yi) {
            return 0 <= xi & xi < this.Nsize & 0 <= yi & yi < this.Nsize;
        }
        check_okeru_from(board, turn, xi, yi) {
            if (board[yi][xi] != TURN.NONE) return false;
            let ds = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
            for (let d of ds) {
                let _xi = xi; let _yi = yi;
                let dx = d[0]; let dy = d[1];
                _xi += dx; _yi += dy;
                let flag_temp = false;
                while (this.in_board(_xi, _yi)) {
                    if (board[_yi][_xi] == 3 - turn) {
                        _xi += dx; _yi += dy;
                        flag_temp = true;
                    } else {
                        break;
                    }
                }

                if (!this.in_board(_xi, _yi)) continue;
                if (flag_temp && board[_yi][_xi] == turn) {
                    return true;
                }
            }
            return false;
        }
        count_colors() {
            let black = 0;
            let white = 0;
            for (let yi = 0; yi < this.Nsize; yi++) {
                for (let xi = 0; xi < this.Nsize; xi++) {
                    if (this.board[yi][xi] == TURN.BLACK) {
                        black++;
                    } else {
                        if (this.board[yi][xi] == TURN.WHITE) {
                            white++;
                        }
                    }
                }
            }
            return { "BLACK": black, "WHITE": white };
        }
        isover() {
            let ncolors = this.count_colors();
            let nall = ncolors["BLACK"] + ncolors["WHITE"];
            if (nall == this.Nsize * this.Nsize) return true;
            for (let yi = 0; yi < this.Nsize; yi++) {
                for (let xi = 0; xi < this.Nsize; xi++) {
                    if (this.check_okeru_from(this.board, TURN.BLACK, xi, yi)) return false;
                    if (this.check_okeru_from(this.board, TURN.WHITE, xi, yi)) return false;

                }
            }
            return true;
        }

        copy_board_from(board) {
            let temp = [];
            for (let yi = 0; yi < this.Nsize; yi++) {
                temp[yi] = [];
                for (let xi = 0; xi < this.Nsize; xi++) {
                    temp[yi][xi] = board[yi][xi];
                }
            }
            return temp;
        }		
		isYosumi(te){
			if(te[0] == 0 && te[1] == 0) return true;
			if(te[0] == this.Nsize-1 && te[1] == 0) return true;
			if(te[0] == 0 && te[1] == this.Nsize-1) return true;
			if(te[0] == this.Nsize-1 && te[1] == this.Nsize-1) return true;
			return false;
		}
    }

    class Player {
        constructor() {
            this.ishuman = true;
            this.iscpu = false;
        }
        think() {

        }
    }

    class CPU extends Player {
        constructor(game) {
            super();
            this.ishuman = false;
            this.iscpu = true;
            this.game = game;
        }
        think() {
            //console.log("thinking...");
            return this.think_random();
            //return this.think_minimize_okeru();
        }
        think_random() {
            // 置ける中からランダム
            return this.game.okeru[Math.floor(Math.random() * this.game.okeru.length)];
        }
        think_minimize_okeru() {
            // 敵の置ける場所の数を最小にするような手を選ぶ
            let min_okeru = 10000;
            let min_i = -1;
            for (let i = 0; i < this.game.okeru.length; i++) {
                let te = this.game.okeru[i];
                let co = this.count_okeru_from_te(te[0], te[1]);
                if (co < min_okeru) {
                    min_okeru = co;
                    min_i = i;
                }
            }
            return this.game.okeru[min_i];
        }
        count_okeru_from_te(xi, yi) {
            let bf = new BoardFuture(this.game.board, this.game.turn, this.game.Nsize);
            bf.update_te(xi, yi);
            return bf.count_okeru();
        }
		simulate_from_players(board, turn, game, players){
			// Playersを使ってシミュレート
            game.players.push(players[0]);
            game.players.push(players[1]);
            game.board = game.copy_board_from(board);
            game.turn = turn;
            game.refresh_okeru();
            let finished = false;
            while (!finished) {
                game.refresh_okeru();
                if (game.okeru.length == 0) {
                    // 合法手がないとき。
                    game.turn = 3 - game.turn;
                    game.refresh_okeru();
                    if (game.okeru.length == 0) {
                        // パスが二回続いたとき終了する。
                        finished = true;
                    }
                } else {
                    //合法手があるとき
                    //CPUなら、手を考える。
                    let player = game.players[game.turn - 1];
                    if (player.iscpu) {
                        let te = player.think();
                        game.put_disc({ xi: te[0], yi: te[1] });
                    }
                }
                // 終了してるか？
                if (game.isover()) {
                    finished = true;
                }
            }
            let ncolors = game.count_colors();
            let result = TURN.NONE;
            if (ncolors["BLACK"] > ncolors["WHITE"]) result = TURN.BLACK;
            if (ncolors["BLACK"] < ncolors["WHITE"]) result = TURN.WHITE;

            return result;
		}
		
    }

	let BP = [[45, -11, 4, -1, -1, 4, -11, 45],
			  [-11, -16, -1, -3, -3, -1, -16, -11],
			  [4, -1, 2, -1, -1, 2, -1, 4],
			  [-1, -3, -1, 0, 0, -1, -3, -1],
			  [-1, -3, -1, 0, 0, -1, -3, -1],
			  [4, -1, 2, -1, -1, 2, -1, 4],
			  [-11, -16, -1, -3, -3, -1, -16, -11],
			  [45, -11, 4, -1, -1, 4, -11, 45]
			  ];

	class CPUEval extends CPU{
		//塩田（２０１２）の評価関数を用いる
		
		think(){
			let okeru = this.game.okeru;
			let evals = [];
			let maxval = -100000;
			let maxi = 0;
			for(let i=0; i<okeru.length; i++){
				let te = okeru[i];
				//手の場所の価値
				let _bp = 6 * Math.random() * BP[te[1]][te[0]];
				//確定石かどうか
				
				//
				evals.push(_bp);
				if(maxval < _bp){
					maxval = _bp;
					maxi = i;
				}
			}
            
			return okeru[maxi];
		}
	}

    class CPUMonteCarloTree extends CPU {
        //モンテカルロ木探索
		constructor(game, nmax, thres, mythres, C){
			super(game);
			this.nmax = nmax;
			this.thres = thres || 30;
			this.mythres = mythres || 5;
			this.C = C || 0.4;
			this.value_history = [];
			this.has_value_history = true;
		}
        setTrial(n) {
            this.n = n;
        }        
		simulate(Nsize, board, turn) {
            let game = new Othello(Nsize);
            let players = [];
			players.push(new CPU(game));
            players.push(new CPU(game));
			return this.simulate_from_players(board, turn, game, players);
		}
        think() {
            let nmax = this.nmax || 3000;
            let n_total = 0;
            let bf = new BoardFuture(this.game.board, this.game.turn, this.game.Nsize);
            let origin = new Node(null, bf, this.game.turn, this.thres, this.mythres, this.C);
            origin.expand();
            while (n_total < nmax) {
                n_total += 1;

                // nodeを決める。
                //origin.printTree();
                let node = origin.getMaxChild();
                while (!node.isleaf) node = node.getMaxChild();
                //console.log(node);
                let result = this.simulate(this.game.Nsize, node.bf.board, node.bf.turn);
                node.update(result);
            }
            //すべての結果を評価値インジケーターに出力
            let mult;
            if(this.game.players[0].iscpu){
                mult = 1;
            }else if(this.game.players[1].iscpu){
                mult = -1;
            }
            let resultStr = "";
            let resultStrArr = []; //この後ソートするのでデータをここに一時保管
            let resultValueArr = []; 
            const rows = ["a", "b", "c", "d", "e", "f", "g", "h"];
            const columns = [1,2,3,4,5,6,7,8];
            $('#value-viewer').empty();
            $('#value-viewer').append('<ul></ul>');
            for (let i = 0; i < origin.children.length; i++) {
                let eachChild = origin.children[i];
                let eachR = eachChild.results[this.game.turn] / eachChild.n;
                if(eachR == 0) eachR = 0.0001;
                if(eachR == 1) eachR = 0.9999;
                resultStr = rows[Number(eachChild.te[1])] + columns[Number(eachChild.te[0])] + " 評価値: ";
                resultStrArr.push(resultStr);
                resultValueArr.push( mult * (-600 * Math.log((1-eachR) / eachR)).toFixed(2));
            }

            let sorted = [];
            if(this.game.players[0].iscpu){
                sorted = resultValueArr.slice().sort((a,b) => (a > b ? -1 : 1));
            }else{
                sorted = resultValueArr.slice().sort((a,b) => (a < b ? -1 : 1));
            }
            let iLen = sorted.length>=5 ? 5 : sorted.length;

            for(let i=0; i<iLen; i++){
                let res;
                let target = resultValueArr.indexOf(sorted[i]);
                let rValue = resultValueArr[target];
                if(Number(rValue) >= 5500) rValue = "黒必勝";
                if(Number(rValue) <= -5500) rValue = "白必勝";
                res = resultStrArr[target] + rValue;
                $('ul').append('<li>' + res + '</li>');
            }
            
            
            let maxi = origin.getIndexMaxN();
			let maxchild = origin.children[maxi];
			let r = maxchild.results[this.game.turn] / maxchild.n;
			if(r == 0) r = 0.0001;
			if(r == 1) r = 1 - 0.0001;
            //評価値を格納
            if(this.game.players[this.game.turn - 1].iscpu)  this.value_history.push(( -600 * Math.log((1-r) / r)));
			
            return bf.okeru[maxi];
        }
    }

	class CPUMonteCarloEval extends CPUMonteCarloTree{
		simulate(Nsize, board, turn) {
            let game = new Othello(Nsize);
            let players = [];
			players.push(new CPUEval(game));
            players.push(new CPUEval(game));
			return this.simulate_from_players(board, turn, game, players);
		}
	}
    class Node {
        constructor(myParent, bf, originturn, thres, mythres, C) {
            this.parent = myParent;
            this.originturn = originturn; // originのturn
            this.myturn = bf.turn;
            this.children = [];
            this.results = [0, 0, 0];
            this.n = 0;  //そのノードの試行回数
            this.n_total = 0;  //兄弟ノードの試行回数の合計。
            this.thres = thres;
			this.mythres = mythres;
			this.C = C;
            this.bf = bf;
            this.isleaf = true; // expand時にfalseにする
            this.hashi = false;
            if (myParent === null) {
                this.depth = 0;
                this.isorigin = true;
            } else {
                this.depth = this.parent.depth + 1;
				//console.log(this.depth);
                this.isorigin = false;
            }
            this.ucb1 = this.calc_ucb1();
        }
        printTree() {
            let ss = "";
            ss += this.results + " " + this.ucb1 + " maxi = " + this.getIndexMaxUCB1() + "\n";
            for (let child of this.children) {
                ss += child.results + " " + child.ucb1 + " maxi = " + child.getIndexMaxUCB1() + "\n";
            }
            console.log(ss);
        }
        printNode() {
            let ss = "";
            for (let i = 0; i < this.depth + 1; i++) ss += "  ";
            console.log(ss + this.results + " " + this.results[this.originturn] / this.n + " " + this.myturn);
        }

        update(result) {
            this.n += 1;
            this.results[result] += 1;
            this.parent.n_total += 1;
            this.ucb1 = this.calc_ucb1();
            let par = this;
            while (!par.isorigin) {
                par = par.parent;
                par.n += 1;
                par.results[result] += 1;
                par.ucb1 = par.calc_ucb1();
            }
            if (this.n == this.thres && !this.hashi) this.expand();
        }
        calc_ucb1() {
            let n_total;
            if (this.isorigin) {
                n_total = 1;
            } else {
                n_total = this.parent.n_total;
            }
            let win = this.results[3 - this.myturn];　// そのノードでの勝ち。相手は最善を打つ。
            let n = this.n;
            //if(n < 5) return 400000;
			
			let C = this.C;
			
			if(this.bf.count_all_piece() < 40){
				//序盤はまんべんなく読む
				if(n <= this.mythres) return 5;
			}else{
				//終盤は良い手を深く読む
				if(n <= this.mythres) return 5;
			}
			
			
            let ucb1 = win / n + C * Math.sqrt(2 * Math.log(n_total) / this.n);
			//if(this.te != null && this.bf.isYosumi(this.te)) ucb1 += 5;
            
			return ucb1;
        }
        getMaxChild() {
            let val = -1;
            let maxi = -1;
            for (let i = 0; i < this.children.length; i++) {
                let child = this.children[i];
                if (val < child.ucb1) {
                    val = child.ucb1;
                    maxi = i;
                }
            }
            return this.children[maxi];
        }
        getIndexMaxUCB1() {
            let val = -1;
            let maxi = 0;
            for (let i = 0; i < this.children.length; i++) {
                let child = this.children[i];
				let ucb1 = child.ucb1;
                if (child.n == 0) {
                    maxi = i;
                    break;
                }
                if (val < ucb1) {
                    val = ucb1;
                    maxi = i;
                }
            }
            return maxi;
        }
        getIndexMaxN() {
            let maxi = -1;
            let maxval = -1;

            for (let i = 0; i < this.children.length; i++) {
                if (maxval < this.children[i].n) {
                    maxi = i;
                    maxval = this.children[i].n;
                }
            }
            return maxi;
        }
        getIndexMaxWin() {
            let maxi = -1;
            let maxval = -1;
            for (let i = 0; i < this.children.length; i++) {
                if (maxval < this.children[i].n) {
                    maxi = i;
                    maxval = this.children[i].n;
                }
            }
            return maxi;
        }
        expand() {
            if (this.bf.okeru.length == 0) {
                this.bf.turn = 3 - this.bf.turn;
                this.bf.update_okeru();
                if (this.bf.okeru.length == 0) {
                    this.hashi = true;
                    return;
                }
            }
            for (let te of this.bf.okeru) {
                let bf = this.bf.copy();
                bf.put_disc(te[0], te[1]);
                bf.turn = 3 - bf.turn;
                bf.update_okeru();
                let child = new Node(this, bf, this.originturn, this.thres, this.mythres, this.C);
                child.te = te;
                this.children.push(child);

            }
            this.isleaf = false;
        }
    }



    class BoardFuture {
        constructor(board, turn, Nsize) {
            this.future = [];
            this.Nsize = Nsize;
            //this.future.push(this.copy_board_from(board));
            this.board = this.copy_board_from(board);
            this.turn = turn;
            this.update_okeru();
        }
		isYosumi(te){
			if(te[0] == 0 && te[1] == 0) return true;
			if(te[0] == this.Nsize-1 && te[1] == 0) return true;
			if(te[0] == 0 && te[1] == this.Nsize-1) return true;
			if(te[0] == this.Nsize-1 && te[1] == this.Nsize-1) return true;
			return false;
		}
        copy() {
            return new BoardFuture(this.board, this.turn, this.Nsize);
        }
        copy_board_from(board) {
            let temp = [];
            for (let yi = 0; yi < this.Nsize; yi++) {
                temp[yi] = [];
                for (let xi = 0; xi < this.Nsize; xi++) {
                    temp[yi][xi] = board[yi][xi];
                }
            }
            return temp;
        }
        update_te(xi, yi) {
            this.put_disc(xi, yi);
            this.turn = 3 - this.turn;
            this.future.push(this.copy_board_from(this.board));
        }
        back() {
            this.future.pop();
            this.board = this.future[this.future.length - 1];
            this.turn = 3 - this.turn;
        }
        put_disc(xi, yi) {
            let ds = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
            for (let d of ds) {
                let _xi = xi; let _yi = yi;
                let dx = d[0]; let dy = d[1];
                _xi += dx; _yi += dy;
                let flag_temp = false;
                while (this.in_board(_xi, _yi)) {
                    if (this.board[_yi][_xi] == 3 - this.turn) {
                        _xi += dx; _yi += dy;
                        flag_temp = true;
                    } else {
                        break;
                    }
                }
                if (!this.in_board(_xi, _yi)) continue;
                if (flag_temp & this.board[_yi][_xi] == this.turn) {
                    while ((_xi != xi) || (_yi != yi)) {
                        this.board[_yi][_xi] = this.turn;
                        _xi -= dx; _yi -= dy;
                    }
                    this.board[_yi][_xi] = this.turn;

                }
            }
        }
        check_okeru(xi, yi) {
            return this.check_okeru_from(this.board, this.turn, xi, yi);
        }
        check_okeru_from(board, turn, xi, yi) {
            if (board[yi][xi] != TURN.NONE) return false;
            let ds = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
            // let ds = [[1, 0], [-1, 0]];
            for (let d of ds) {
                let _xi = xi; let _yi = yi;
                let dx = d[0]; let dy = d[1];
                _xi += dx; _yi += dy;
                let flag_temp = false;
                while (this.in_board(_xi, _yi)) {
                    if (board[_yi][_xi] == 3 - turn) {
                        _xi += dx; _yi += dy;
                        flag_temp = true;
                    } else {
                        break;
                    }
                }
                if (!this.in_board(_xi, _yi)) continue;
                if (flag_temp && board[_yi][_xi] == turn) {
                    return true;
                }
            }
            return false;
        }
        in_board(xi, yi) {
            return 0 <= xi & xi < this.Nsize & 0 <= yi & yi < this.Nsize;
        }
        count_okeru() {
            let board = this.board;
            let turn = this.turn;
            let okeru = [];
            for (let yi = 0; yi < this.Nsize; yi++) {
                for (let xi = 0; xi < this.Nsize; xi++) {
                    if (this.check_okeru_from(board, turn, xi, yi)) {
                        okeru.push([xi, yi]);
                    }
                }
            }
            return okeru.length;
        }
		count_all_piece(){
			let count = 0;
            for (let yi = 0; yi < this.Nsize; yi++) {
                for (let xi = 0; xi < this.Nsize; xi++) {
                    if (this.board[yi][xi] != TURN.NONE) {
                        count += 1;
                    }
                }
            }
			return count;
		}
        update_okeru() {
            this.okeru = [];
            for (let yi = 0; yi < this.Nsize; yi++) {
                for (let xi = 0; xi < this.Nsize; xi++) {
                    if (this.check_okeru(xi, yi)) {
                        this.okeru.push([xi, yi]);
                    }
                }
            }
        }

    }
    
    let maneger = new OthelloController(8, cnvs.width());
    let p_main = cnvs.position();
    let mouse_global = { x: 0, y: 0 };
    let clicked = false;
    cnvs.mousemove((e) => {
        let x = e.pageX - p_main.left;
        let y = e.pageY - p_main.top;
        mouse_global.x = x;
        mouse_global.y = y;
    });
    cnvs.click(() => {
        clicked = true;
    });

    $("#vsCPU-b1").click(() => {
        $("#level-viewer").text("Lv.1(20,000手検討)");
        maneger.game.SetInitBoard();
        maneger.game.okeru = [];
        maneger.start_cpu(1, 20000);
    });
    $("#vsCPU-b2").click(() => {
        $("#level-viewer").text("Lv.2(30,000手検討)");
        maneger.game.SetInitBoard();
        maneger.game.okeru = [];
        maneger.start_cpu(1, 30000);
    });
    $("#vsCPU-b3").click(() => {
        $("#level-viewer").text("Lv.3(40,000手検討)");
        maneger.game.SetInitBoard();
        maneger.game.okeru = [];
        maneger.start_cpu(1, 40000);
    });

    $("#vsCPU-w1").click(() => {
        $("#level-viewer").text("Lv.1(20,000手検討)");
        maneger.game.SetInitBoard();
        maneger.game.okeru = [];
        maneger.start_cpu(2, 20000);
    });
    $("#vsCPU-w2").click(() => {
        $("#level-viewer").text("Lv.2(30,000手検討)");
        maneger.game.SetInitBoard();
        maneger.game.okeru = [];
        maneger.start_cpu(2, 30000);
    });
    $("#vsCPU-w3").click(() => {
        $("#level-viewer").text("Lv.3(40,000手検討)");
        maneger.game.SetInitBoard();
        maneger.game.okeru = [];
        maneger.start_cpu(2, 40000);
    });

    $("#back").click(() => {
		$("#back").hide();
        $(".simulation").hide();
		$(".cpubtn").hide();
        $(".startbtn").show();
		$("#cnvs").addClass("w3-opacity");
		$("#levelbox").show();
		maneger.gameChu = false;
		maneger.lastte = null;
    });

    function render() {
        maneger.update(mouse_global);
    }
    setInterval(render, 100);
});
