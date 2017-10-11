import _ from 'lodash';
import $ from 'jquery';
import { REST } from './rest.js';

let roomTemplate;
let user = {};

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
  console.log('updateRoom');
  REST('GET', '/room')
    .then(rooms => {
      $('#rooms').html(_.map(rooms, (room) => {
        const params = _.defaults({ 
          createdBy: room.createdBy.name,
          idCreatedBy: room.createdBy.id,
          members: _.map(room.members, user => user.name).join(',') 
        }, room);
        return roomTemplate.map((item, index) => (index % 2) ? params[item] : item).join('');
      }));
      _.forEach(rooms, room => {
        if (room.createdBy.id === user._id) {
          $(`#rooms #${room.id} .operation`).html(`
            <button class="withdraw">Withdraw!</button>
          `);
          $(`#rooms #${room.id} .operation .withdraw`).on('click', e => {
            if (confirm(`Are you want to withdraw hosting ${room.name}?`)) {
              REST('DELETE', `/room/${room.id}`)
                .then(() => {
                  console.log(`deletion ${room.id} success. update rooms.`)
                  updateRooms();
                  return null;
                })
                .catch(err => console.dir(err));
            }
          });
        }
      });
      return rooms;
    });
}
  
$('div#content').load('templates/lobby.htm', updateLobby);