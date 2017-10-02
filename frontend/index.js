import _ from 'lodash';
import $ from 'jquery';
import { GET, POST, PUT, DELETE } from './rest.js';

let user;
let roomTemplate;

// $('div#content').load('templates/login.htm', e => {
//   $('section form').submit(e => {
//     const username = $('#username').val();
//     const password = $('#password').val();
//     POST('/login', { username, password })
//       .then((value) => {
//         user = username;
//         $('div#content').load('templates/lobby.htm', updateLobby);
//       })
//       .catch((err) => {
//         $('p#error').html(`${JSON.stringify(err)}`); 
//       });
//     e.preventDefault();
//   });
// });

function updateLobby() {
  roomTemplate = $('script[data-template="room"]').text().split(/\$\{(.+?)\}/g);
  const today = new Date();
  $('#today').text(today.toLocaleDateString());
  $('#createRoom').submit(e => {
    const body = _(['name', 'description', 'maximum'])
      .map(key => [key, $(`#createRoom ${key}`)])
      .fromPairs()
      .value();
    PUT('/room', body).then(updateRooms);
    e.preventDefault();
  });
  updateRooms();
}

function updateRooms() {
  GET('/room')
    .then(rooms => {
      const formatRoom = _.map(rooms, (room, id) => {
        const params = _.defaults({ id, members: room.members.join(',') }, room);
        return roomTemplate.map((item, index) => (index % 2) ? params[item] : item).join('');
      });
      $('#rooms').html(formatRoom.join(''));
    });
}

$('div#content').load('templates/lobby.htm', updateLobby);