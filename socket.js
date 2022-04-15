let heartTimer;
let closeTimer;
function createSocket(user, res) {
    const sip = res.ip;
    const sport = res.port;
    user.sio = io(`http://${sip}:${sport}`);
    addSocketEmit(user);
    user.sio.on('connect', () => {
        user.sio.emit('login', JSON.stringify({
            token: res.token,
            roomid: res.roomid,
            time: res.time,
            sign: res.sign
        }));
    });
    user.sio.on("disconnect", () => {
        console.log('连接失败')
        user.sio.connect();
    });

    user.sio.on("connect_error", (error) => {
        console.log(error);
    });

    user.sio.on("connect_failed", (error) => {
        console.log(error);
    });

    user.sio.on("game_pong", function () {
        console.log('game_pong')
        resetHeart();
        startHeart(user.sio);
    });
    user.sio.onAny((event, ...args) => {
        console.log(`got ${event}`);
    });
}

function resetHeart() {
    clearTimeout(heartTimer);
    clearTimeout(closeTimer);
}

function startHeart(socket) { // 开启心跳
    heartTimer = setTimeout(() => {
        console.log('game_ping')
        socket.emit('game_ping');
        closeTimer = setTimeout(() => {
            close(socket);
        }, 10000);
    }, 5000)
}

function close(socket) {
    if (socket && socket.connected) {
        socket.connected = false;
        socket.disconnect();
        socket = null;
    }
}

function addSocketEmit(user) {
    const socket = user.sio;
    socket.on('login_result', function (res) {
        if (res.errcode === 0) { //连接成功 开启心跳
            const data = res.data;
            user.game = {
                roomId: data.roomid,
                conf: data.conf,
                maxGames: data.conf.maxGames,
                numofgames: data.conf.numofgames,
                seats: data.seats,
                isOver: false,
                seatindex: getSeatIndex(data.seats, user.userid)
            };
            refresh(user)
            startHeart(socket);
        }
    });

    socket.on('login_finished', function (res) {

    });

    socket.on('exit_result', function (res) {

    });

    socket.on('exit_notify_push', function (res) {

    });

    socket.on('dispress_push', function (data) {

    });

    socket.on('new_user_comes_push', function (res) {
        const seatindex = res.seatindex;
        if (user.game.seats[seatindex].userid > 0) {
            user.game.seats[seatindex].online = true;
        } else {
            user.game.seats[seatindex] = data;
        }
        refresh(user);
    });

    socket.on('user_state_push', function (res) {
        const seat = getSeatByIndex(user, res.userid);
        seat.online = res.online;
        refresh(user);
    });

    socket.on('user_ready_push', function (res) {
        const userId = res.userid;
        const seat = getSeatByIndex(user, userId);
        seat.ready = res.ready;
        refresh(user);
    });

    socket.on('mj_count_push', function (res) {

    });

    socket.on('game_holds_push', function (res) {
        console.log('game_holds_push' + res);
    });

    socket.on('game_begin_push', function (res) {
        console.log('game_begin_push' + res);
    })

    socket.on('game_num_push', function (res) {
        console.log('game_num_push' + res);
    });

    socket.on('game_playing_push', function (res) {
        console.log('game_playing_push' + res);
    });

    socket.on('game_sync_push', function (res) {
        const data = res;
        const game = user.game;
        game.numofmj = data.numofmj;
        game.gamestate = data.state;
        if (game.gamestate === 'dingque') {
            game.isDingQueing = true;
        } else if (game.gamestate === 'huanpai') {
            game.isHuanSanZhang = true;
        }
        game.turn = data.turn;
        game.button = data.button;
        game.chuPai = data.chuPai;
        for (let i = 0; i < 4; i++) {
            let seat1 = game.seats[i];
            let seat2 = data.seats[i];
            seat1.holds = seat2.holds;
            seat1.folds = seat2.folds;
            seat1.angangs = seat2.angangs;
            seat1.diangangs = seat2.diangangs;
            seat1.wangangs = seat2.wangangs;
            seat1.pengs = seat2.pengs;
            seat1.dingque = seat2.que;
            seat1.hued = seat2.hued;
            seat1.iszimo = seat2.iszimo;
            seat1.huinfo = seat2.huinfo;
            seat1.huanpais = seat2.huanpais;
            if (i === game.seatIndex) {
                game.dingque = seat2.que;
            }
        }
        refresh(user);
    });

    socket.on('game_action_push', function (res) {
        if (res) {
            alert(JSON.stringify(res));
        }
        console.log('game_action_push', user.name, res);
        const game = user.game;
        game.curaction = res;
        refresh(user);
    });

    socket.on('game_huanpai_push', function (res) {
        console.log('game_huanpai_push', res);
    });

    socket.on('game_dingque_push', function (res) {
        const game = user.game;
        game.isDingQueing = true;
        game.isHuanSanZhang = false;
    });

    socket.on('game_dingque_notify_push', function (res) {
        console.log(`${res},定缺结束`,);
    });

    socket.on('game_dingque_finish_push', function (res) {
        const game = user.game;
        for (let i = 0; i < res.length; i++) {
            game.seats[i].dingque = res[i];
        }
    });

    socket.on('game_chupai_push', function (res) {
        const game = user.game;
        const turnUserId = res;
        const si = getSeatIndex(game.seats, turnUserId);
        const data = {
            last: game.turn,
            turn: si
        }
        game.turn = si;
        console.log('game_chupai_push', data);
    });

    socket.on('game_chupai_notify_push', function (res) {
        const si = getSeatIndex(user.game.seats, res.userId);
        doChupai(user, si, res.pai);
    });

    socket.on('hangang_notify_push', function (res) {

    })

    socket.on('peng_notify_push', function (res) {
        doPeng(user, res.userid, res.pai)
    });

    socket.on('guo_notify_push', function (res) {
        console.log('guo_notify_push', res);
    });

    socket.on('guo_result', function (res) {
        console.log('guo_result', res);
    });

    socket.on('guo_hu_push', function (res) {
        console.log('guo_hu_push', res);
    });

    socket.on('game_mopai_push', function (res) {
        doMopai(user, res);
    });

    // socket.onAny(function (event, data) {
    //     console.log('start');
    //     console.log(event);
    //     console.log(data);
    //     console.log('end');
    // })
}

// 摸牌处理
function doMopai(user, pai) {
    const game = user.game;
    const seat = game.seats[game.seatindex];
    seat.holds.push(pai);
    refresh(user);
}

// 出牌处理
function doChupai(user, si, pai) {
    const game = user.game;
    const seat = game.seats[si];
    if (seat.holds) {
        var idx = seat.holds.indexOf(pai);
        if (idx > -1) {
            seat.holds.splice(idx, 1);
            seat.folds.push(pai);
        }
    }
    refresh(user);
}

// 碰牌处理
function doPeng(user, userid, pai) {
    const seat = getSeatByIndex(user, userid);
    if (seat.holds) {
        for (let i = 0; i < 2; i++) {
            const index = seat.holds.indexOf(pai);
            seat.holds.splice(index, 1);
        }
    }
    const pengs = seat.pengs;
    pengs.push(pai);
    refresh(user);
}

// 杠牌处理
function doGange(user) {

}

// 定缺
function showDingQueChoice(user) {
    const game = user.game;
    var sd = game.seats[game.seatindex];
    var typeCounts = [0, 0, 0];
    for (var i = 0; i < sd.holds.length; ++i) {
        var pai = sd.holds[i];
        var type = getMahjongType(pai);
        typeCounts[type]++;
    }

    var min = 65535;
    var minIndex = 0;
    for (var i = 0; i < typeCounts.length; ++i) {
        if (typeCounts[i] < min) {
            min = typeCounts[i];
            minIndex = i;
        }
    }
    send(user, 'dingque', minIndex);
}

//出牌
function chupai(user, pai) {
    send(user, 'chupai', pai);
}

function guo(user) {
    send(user, 'guo', null);
}

function peng(user) {
    send(user, 'peng', null);
}

function gang(user, pai) {
    send(user, 'peng', pai);
}

function ready(user) {
    send(user, 'ready', null)
}

function send(user, event, data) {
    const socket = user.sio;
    socket.emit(event, data);
}