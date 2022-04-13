

function getMahjongType(id) {
    if (id >= 0 && id < 9) {
        return 0;
    }
    else if (id >= 9 && id < 18) {
        return 1;
    }
    else if (id >= 18 && id < 27) {
        return 2;
    }
}

function getSeatByIndex(user, userId) {
    const si = user.game.seats.findIndex(x => x.userid === userId);
    return user.game.seats[si];
}

function getSeatIndex(seats, userId) {
    return seats.findIndex(x => x.userid === userId);
}

function encode(params) {
    let str = '';
    if (params) {
        const arr = [];
        for (const key in params) {
            const value = params[key] === null || params[key] === undefined ? '' : params[key];
            arr.push(`${key}=${value}`);
        }
        if (arr.length > 0) {
            str = '?' + arr.join('&');
        }
    }
    return str;
}

function refresh(user) {
    const name = user.name;
    const game = user.game;
    if (game) {
        const seat = game.seats[game.seatindex];
        let folds = seat.folds;
        let holds = seat.holds;
        const divs = [];
        if (holds) {
            holds.sort((a, b) => a - b);
            divs.push(`<div class="box mj-list">${holds.map(x => `<span class="mj" id="${user.name}-${x}">${nameMap.get(x)}</span>`).join('')}</div>`)
        }

        if (folds) {
            folds = folds.map(x => nameMap.get(x));
            divs.push(`<div class="box mj-list">${folds.map(x => `<span class="mj">${x}</span>`).join('')}</div>`)
        }

        $(`#${name}-pai`).html(divs.join(''))
    }
    if (game && game.turn > -1) {
        turn = game.turn;
    }
    $('#chupaiIndex').html(turn);
    $(`#${name}`).html(syntaxHighlight({ ...user, sio: '' }));
}

function syntaxHighlight(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}