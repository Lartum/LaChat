const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/message')
const { addUser, removeUser, getUser, getUsersByRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT

const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))

let serverMessage = 'welcome'
const filter = new Filter()

io.on('connection', (socket) =>{
    console.log('Socket connection established with client')

    socket.on('joinRoom', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if(error){
          return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage(serverMessage))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined the room`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersByRoom(user.room)
        })
        
        callback()
    })

    socket.on('sendMessage', (clientMessage, callback) =>{
        const user = getUser(socket.id)
   
            if(filter.isProfane(clientMessage)){
                return callback('no profanity allowed')
            }
            io.to(user.room).emit('message', generateMessage(user.username,clientMessage))   
        callback()
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, location))
        if(!location){
            return callback('Location was no available')
        }
        callback()
    })


    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage(`${user} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersByRoom(user.room)
            })
        }

    })
})



server.listen(port, () =>{
    console.log('port running on ' + port )
})