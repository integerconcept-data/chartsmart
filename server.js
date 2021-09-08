const path= require('path');
const http= require('http');
const express = require('express');
const socketio= require('socket.io');
const formatMessage= require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers}= require('./utils/users');





const app=express();
const server=http.createServer(app);
const io=socketio(server);


//set static folder
app.use(express.static(path.join(__dirname,'public')));
const botname='chatsmart';
//Run when client connects
io.on('connection',socket => {
	console.log('New User connection....');
	//join chartRoom
	socket.on('joinRoom',({username,room})=>{
		const user=userJoin(socket.id,username,room);
		socket.join(user.room);
		//Welcome current user
		socket.emit('message',formatMessage(user.room,`welcome ${user.username}`));
		//broadcast when a user connect
		socket.broadcast.to(user.room).emit('message',formatMessage(botname,`${user.username} has join the chat!!`));

		//Send users and room info

		io.to(user.room).emit('roomUsers',{room:user.room,users:getRoomUsers(user.room)});
	});
	

	// Runs when a client disconnect
	socket.on('disconnect', ()=>{
		const user=userLeave(socket.id);
		if(user){
			io.to(user.room).emit('message',formatMessage(botname,`${user.username} has left the chat`));

			//Send users and room info

			io.to(user.room).emit('roomUser',{room:user.room,users:getRoomUsers(user.room)});
		}
		
	});
	//Listen for chatMessage
	socket.on('chatMessage',msg=>{
		const user=getCurrentUser(socket.id);
		io.to(user.room).emit('message',formatMessage(user.username,msg));
		//console.log(msg);
	});
});

const PORT=3000 || process.env.PORT;


server.listen(PORT,()=> console.log(`server running on port ${PORT}`));