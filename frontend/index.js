import _ from 'lodash';
import $ from 'jquery';
import { REST } from './rest.js';

let roomTemplate;
let user;

function updateRoomOperation() {
  $('#createRoom').submit(e => {
    const body = _.fromPairs(_.map(e.target, item => [item.id, item.value]));
    console.dir(body);
    REST('PUT', '/room', body).then(updateRooms);
    e.preventDefault();
  });
}

function updateLobby() {
  roomTemplate = $('script[data-template="room"]').text().split(/\$\{(.+?)\}/g);
  const today = new Date();
  $('#today').text(today.toLocaleDateString());
  REST('GET', '/user/me')
    .then(ret => {
      user = ret;
      localStorage.setItem('funlunch-user', JSON.stringify(ret));
      localStorage.setItem('funlunch-bearer', JSON.stringify(ret.accessToken));
      $('#you').html(`${user.name} <a href='/auth/logout'>logout</a>`);
      $('#operation').load('templates/roomOperations.htm', updateRoomOperation);
    })
    .catch(err => $('#operation').load('templates/login.htm'));

  updateRooms();
}

function updateRooms() {
  REST('GET', '/room')
    .then(rooms => {
      const formatRoom = _.map(rooms, (room, id) => {
        const params = _.defaults({ id, members: room.members.join(',') }, room);
        return roomTemplate.map((item, index) => (index % 2) ? params[item] : item).join('');
      }) || [];
      $('#rooms').html(formatRoom.join(''));
    });
}
  
$('div#content').load('templates/lobby.htm', updateLobby);