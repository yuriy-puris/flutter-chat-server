const server = require('http').createServer();
const io = require('socket.io')(server);


const user = {

};

const rooms = {

};

io.on('connection', io => {
    console.log('Connection established with a client');
});

io.on('validate', (inData, inCallback) => {
    const user = users[inData.username];
    console.log(inData, user);
    if ( user ) {
        if ( user.password === inData.password ) {
            inCallback({ status: 'ok' });
        } else {
            inCallback({ status: 'fail' });
        }
    } else {
        users[inData.username] = inData;
        io.broadcast.emit('newUser', users);
        inCallback({ status: 'created' });
    }
});

io.on('create', (inData, inCallback) => {
    if ( rooms[inData.roomName] ) {
        inCallback({ status: 'exists' });
    } else {
        inData.users = {};
        rooms[inData.roomName] = inData;
        io.broadcast.emit('created', rooms);
        inCallback({ status: 'created', rooms: rooms });
    }   
});

io.on('listRooms', (inData, inCallback) => {
    inCallback(rooms);
});

io.on('listUsers', (inData, inCallback) => {
    inCallback(users);
});

io.on('join', (inData, inCallback) => {
    const room = rooms[inData.roomName];
    if ( Object.keys(rooms).length >= rooms.maxPeople ) {
        inCallback({ status: 'full' });
    } else {
        room.users[inData.username] = inData;
        io.broadcast.emit('joined', room);
        inCallback({ status: 'joined', room: room });
    }
});

io.on('post', (inData, inCallback) => {
    io.broadcast.emit('posted', inData);
    inCallback({ status: 'ok' });
});

io.on('invite', (inData, inCallback) => {
    io.broadcast.emit('invite', inData);
    inCallback({ status: 'ok' });
});

io.on('leave', (inData, inCallback) => {
    const room = rooms[inData.roomName];
    delete room.users[inData.username];
    io.broadcast.emit('left', room);
    inCallback({ status: 'ok' });
});

io.on('close', (inData, inCallback) => {
    delete rooms[inData.roomName];
    io.broadcast.emit('closed', { roomName: inData.roomName, rooms: rooms });
    inCallback({ status: 'ok' });
});

io.on('kick', (inData, inCallback) => {
    const room = rooms[inData.roomName];
    const users = room.users;
    delete users[inData.username];
    io.broadcast.emit('kicked', room);
    inCallback({ status: 'ok' });
});


const server_port = process.env.PORT || 3000;
server.listen(server_port, err => {
  if (err) throw err
  console.log('Listening on port %d', server_port);
});