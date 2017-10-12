import _ from 'lodash';
import $ from 'jquery';
import { REST } from './rest.js';

let templates;
let me = {};
let roomOperations = {
  withdraw: (room) => {
    if (confirm(`Are you want to withdraw hosting ${room.name}?`)) {
    REST('DELETE', `/room/${room.id}`)
      .then(() => {
        console.log(`deletion ${room.id} success. update rooms.`);
        updateRooms();
        return null;
      })
      .catch(err => console.dir(err));
    }
  },
  enter: (room) => {
    REST('PUT', `/room/${room.id}`)
      .then(() => {
        console.log(`succeed to enter into ${room.name}.`);
        updateRooms();
        return null;
      })
  },
  leave: (room) => {
    REST('DELETE', `/room/${room.id}/me`)
      .then(() => {
        console.log('succeed to leave from ${room.name}');
        updateRooms();
        return null;
      })
  }
}

function updateRoomOperation() {
  $('#createRoom').submit(e => {
    const body = _.fromPairs(_.map(e.target, item => [item.id, item.value]));
    console.dir(body);
    REST('PUT', '/room', body).then(updateRooms);
    e.preventDefault();
  });
}

function updateLobby() {
  templates = {
    room: $('script[data-template="room"]').text().split(/\$\{(.+?)\}/g)
  };
  ['withdraw','enter','leave'].forEach(key => {
    templates[key] = $(`script[data-template="${key}"`).text();
  });
  const today = new Date();
  $('#today').text(today.toLocaleDateString());
  REST('GET', '/user/me')
    .then(ret => {
      me = ret;
      localStorage.setItem('funlunch-user', JSON.stringify(ret));
      localStorage.setItem('funlunch-bearer', JSON.stringify(ret.accessToken));
      $('#you').html(`${me.name} <a href='/auth/logout'>logout</a>`);
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
        return templates.room.map((item, index) => (index % 2) ? params[item] : item).join('');
      }));
      if (!_.isEmpty(me)) {
        _.forEach(rooms, room => {
          const operators = [];
          if (room.createdBy.id === me._id) operators.push('withdraw');
          if (_.find(room.members, user => me._id === user.id) === undefined) operators.push('enter');
          else operators.push('leave');

          $(`#rooms #${room.id} .operation`).html(operators.map(key => templates[key]).join('\n'));
          _.forEach(operators, key => {
            $(`#rooms #${room.id} .operation .${key}`).on('click', e => roomOperations[key](room));
          });
        });
      }
      return rooms;
    });
}
  
$('div#content').load('templates/lobby.htm', updateLobby);