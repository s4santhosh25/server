
var users = [];

module.exports = (io) => {
    io.on('connection', (socket) => {
        var updateUsers = []
        socket.emit('hello', 'can you hear me?', 1, 2, 'abc');
        socket.on('send_userDetails', (result) => {
            // console.log('send_userDetails', data);
            delete result['token'];
            delete result['iat'];
            delete result['exp'];
            socket.uniqueId = result.email;
            socket[result.email] = result;
            let unique = users.filter(data => data.email === result.email);
            if (unique.length === 0) {
                users.push({ ...result, socketId: socket.id, online: socket.connected, offline: socket.disconnected })
            } else {
                for (var i = 0; i < users.length; i++) {
                    if (users[i].email === result.email)
                        updateUsers.push({ ...users[i], socketId: socket.id, online: socket.connected, offline: socket.disconnected });
                    else
                        updateUsers.push({ ...users[i] })
                }
            }
            if (unique.length === 0)
                io.emit('send_UsersList', users)
            else {
                users.length = 0;
                users = [...updateUsers];
                io.emit('send_UsersList', users)
            }
        })

        socket.on('disconnect', (data) => {
            let findIndex = users.findIndex(data => data.email === socket.uniqueId);
            let [updatedData] = users.filter(data => data.email === socket.uniqueId).map(d => ({ ...d, online: socket.connected, offline: socket.disconnected }))
            users[findIndex] = updatedData
            console.log('disconnect', users);
            io.emit('send_UsersList', users)
        })

        socket.on('private_message', (data) => {
            console.log('private_message', data)
            io.to(data.receiver.socketId).emit('incoming_msg', data)
            socket.emit('ack', data)
        })

        console.log('users', users);
    });
}