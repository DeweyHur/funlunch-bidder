import _ from 'lodash';
import $ from 'jquery';
import { GET, POST, PUT, DELETE } from './rest.js';

let roomTemplate;
let user;

function updateRoomOperation() {
  $('#createRoom').submit(e => {
    const body = _(['name', 'description', 'maximum'])
      .map(key => [key, $(`#createRoom ${key}`)])
      .fromPairs()
      .value();
      
    PUT('/room', body).then(updateRooms);
    e.preventDefault();
  });
}

function updateLobby() {
  roomTemplate = $('script[data-template="room"]').text().split(/\$\{(.+?)\}/g);
  const today = new Date();
  $('#today').text(today.toLocaleDateString());
  GET('/user/me')
    .then(ret => {
      user = ret;
      localStorage.setItem('funlunch-user', JSON.stringify(ret));
      $('#operation').load('templates/roomOperations.htm', updateRoomOperation);
    })
    .catch(err => $('#operation').load('templates/login.htm'));

  updateRooms();
}

function updateRooms() {
  GET('/room')
    .then(rooms => {
      const formatRoom = _.map(rooms, (room, id) => {
        const params = _.defaults({ id, members: room.members.join(',') }, room);
        return roomTemplate.map((item, index) => (index % 2) ? params[item] : item).join('');
      }) || [];
      $('#rooms').html(formatRoom.join(''));
    });
}
  
$('div#content').load('templates/lobby.htm', updateLobby);