const ip = `120.79.100.219`;
const url = `http://${ip}:9000`;
const clientUrl = `http://${ip}:9001`;
const roomUrl = `http://${ip}:9002`;
const gameUrl = `http://${ip}:9003`;
let roomid = '';
let turn = -1;
let gangUser = null;
const nameMap = new Map([
    [0, '1筒'],
    [1, '2筒'],
    [2, '3筒'],
    [3, '4筒'],
    [4, '5筒'],
    [5, '6筒'],
    [6, '7筒'],
    [7, '8筒'],
    [8, '9筒'],
    [9, '1条'],
    [10, '2条'],
    [11, '3条'],
    [12, '4条'],
    [13, '5条'],
    [14, '6条'],
    [15, '7条'],
    [16, '8条'],
    [17, '9条'],
    [18, '1万'],
    [19, '2万'],
    [20, '3万'],
    [21, '4万'],
    [22, '5万'],
    [23, '6万'],
    [24, '7万'],
    [25, '8万'],
    [26, '9万'],
    [27, '中'],
    [28, '发'],
    [29, '白'],
    [30, '东'],
    [31, '西'],
    [32, '南'],
    [33, '北']
])
const obj = {
    user1: {},
    user2: {},
    user3: {},
    user4: {}
};

const room = {};
if (localStorage.getItem('room')) {
    room = JSON.parse(localStorage.getItem('room'));
}

for (let i = 0; i < 4; i++) {
    const user = getUser(i);
    const btnGuest = $(`#auth${i + 1}`);
    btnGuest.on('click', function () {
        auth(user.name).then(res => {
            if (res.errcode === 0) {
                user.account = res.account;
                user.sign = res.sign;
                refresh(user);
            }
        })
    });
    const btnLogin = $(`#btnLogin${i + 1}`);
    btnLogin.on('click', function () {
        login(user.account, user.sign)
            .then(res => {
                if (res.errcode === 0) {
                    user.account = res.account;
                    // user.sign = res.sign;
                    user.coins = res.coins;
                    user.exp = res.exp;
                    user.gems = res.gems;
                    user.ip = res.ip;
                    user.userid = res.userid;
                    user.roomid = res.roomid;
                    refresh(user);
                    if (user.roomid) {
                        roomid = user.roomid;
                        return enterRoom(user.account, user.sign, user.roomid);
                    }
                }
            })
            .then(res => {
                if (res && res.errcode === 0) {
                    createSocket(user, res);
                }
            });
    });
    const btnRole = $(`#btnRole${i + 1}`);
    btnRole.on('click', function () {
        createRole(user.account, user.sign, user.name).then(res => {
            if (res.errcode === 0) {
                console.log('创建成功');
            }
            console.log(res.errmsg);
        });
    });
    const btnAddRoom = $(`#btnAddRoom${i + 1}`);
    btnAddRoom.on('click', function () {
        enterRoom(user.account, user.sign, roomid).then(res => {
            createSocket(user, res);
        });
    });
    const btnDingque = $(`#dingque${i + 1}`);
    btnDingque.on('click', function () {
        showDingQueChoice(user);
    });
    const btnChupai = $(`#chupai${i + 1}`);
    btnChupai.on('click', function () {
        const index = $(`#chupaiIndex${i + 1}`);
        const pai = Number(index[0].value);
        const seat = user.game.seats[user.game.seatindex];
        const holds = seat.holds;
        if (holds.indexOf(pai) > -1) {
            chupai(user, pai);
        }
    });

    const btnGuo = $(`#guo${i + 1}`)
    btnGuo.on('click', function () {
        guo(user);
    });

    const btnPeng = $(`#peng${i + 1}`)
    btnPeng.on('click', function () {
        peng(user);
    });

    const btnGang = $(`#gang${i + 1}`)
    btnGang.on('click', function () {
        gangUser = user;
    });

    const btnReady = $(`#btnReady${i + 1}`)
    btnReady.on('click', function () {
        ready(user);
    });
}

$('.box').on('click', '.mj', function () {
    if (gangUser) {
        const id = $(this)[0].id;
        const pai = Number(id.split('-')[1]);
        gang(gangUser, pai)
        gangUser = null;
    } else {
        const id = $(this)[0].id;
        const name = id.split('-')[0];
        const pai = Number(id.split('-')[1]);
        const user = obj[name];
        const game = user.game;
        if (game.turn === game.seatindex) {
            console.log($(this)[0]);
            console.log(`${name},出牌}`,)
            chupai(user, pai);
        }
    }
})

// 创建房间
$('#btnCreateRoom1').on('click', function () {
    const user1 = obj['user1'];
    createRoom(user1.account, user1.sign, JSON.stringify({
        type: 'xzdd',
        difen: 0,
        zimo: 0,
        jiangdui: false,
        huansanzhang: false,
        zuidafanshu: 0,
        jushuxuanze: 0,
        dianganghua: 0,
        menqing: false,
        tiandihu: false
    })).then(res => {
        if (res.errcode === 0) {
            room = res;
            localStorage.setItem('room', JSON.stringify(room));
        }
    })
});