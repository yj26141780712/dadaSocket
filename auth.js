function getUser(i) {
    const name = `user${i + 1}`;
    const user = obj[name];
    user.name = name;
    return user;
}

function auth(account) {
    return new Promise((resolve) => {
        $.ajax({
            method: 'get',
            url: `${url}/auth?account=${account}&password=${account}`,
            success: (data) => {
                resolve(data);
            }
        });
    })
}

function login(account, sign) {
    return new Promise((resolve) => {
        $.ajax({
            method: 'get',
            url: `${clientUrl}/login?account=${account}&sign=${sign}`,
            success: (data) => {
                resolve(data);
            }
        });
    })
}

function createRole(account, sign, name) {
    return new Promise((resolve) => {
        $.ajax({
            method: 'get',
            url: `${clientUrl}/create_user?account=${account}&sign=${sign}&name=${name}`,
            success: (data) => {
                resolve(data);
            }
        });
    })
}

function createRoom(account, sign, conf) {
    return new Promise((resolve) => {
        $.ajax({
            method: 'get',
            url: `${clientUrl}/create_private_room${encode({
                account,
                sign,
                conf
            })}`,
            success: (data) => {
                resolve(data);
            }
        })
    })
}

function enterRoom(account, sign, roomId) {
    return new Promise((resolve) => {
        $.ajax({
            method: 'get',
            url: `${clientUrl}/enter_private_room${encode({
                account,
                sign,
                roomid: roomId
            })}`,
            success: (data) => {
                resolve(data);
            }
        })
    })
}

