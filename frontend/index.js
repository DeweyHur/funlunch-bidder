import _ from 'lodash';
import $ from 'jquery';
import { REST } from './rest.js';

let templates = {};
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

function templateToHTML(key, params) {
  return templates[key].map((item, index) => (index % 2) ? params[item] : item).join('');

}

function updateRoomOperation() {
  $('#operation').html(templateToHTML('operations'));
  $('#createRoom').submit(e => {
    const body = _.fromPairs(_.map(e.target, item => [item.id, item.value]));
    console.dir(body);
    REST('PUT', '/room', body).then(updateRooms);
    e.preventDefault();
  });
}

function updateLobby() {
  const today = new Date();
  $('#today').text(today.toLocaleDateString());
  REST('GET', '/user/me')
    .then(ret => {
      me = ret;
      localStorage.setItem('funlunch-user', JSON.stringify(ret));
      localStorage.setItem('funlunch-bearer', JSON.stringify(ret.accessToken));
      $('#you').html(templateToHTML('userinfo', { name: me.name }));
      updateRoomOperation();
    })
    .catch(err => $('#operation').load('templates/login.htm'));

  updateRooms();
}

function updateRooms() {
  console.log('updateRoom');
  REST('GET', '/room')
    .then(rooms => {
      $('#rooms').html(_.map(rooms, (room) => templateToHTML('room', _.defaults({ 
        createdBy: room.createdBy.name,
        idCreatedBy: room.createdBy.id,
        members: _.map(room.members, user => user.name).join(',') 
      }, room))));
      if (!_.isEmpty(me)) {
        _(rooms)
          .sortBy(room => room.members.length)
          .forEach(room => {
            const operators = [];
            if (_.find(room.members, user => me._id === user.id) === undefined) operators.push('enter');
            else operators.push('leave');
            if (room.createdBy.id === me._id) operators.push('withdraw');

            const htmlOps = operators.map(templateToHTML).join('\n');
            $(`#rooms #${room.id} .operation`).html(htmlOps);
            _.forEach(operators, key => {
              $(`#rooms #${room.id} .operation .${key}`).on('click', e => roomOperations[key](room));
            });
          });
      }
      return rooms;
    });
}

$('#dataTemplate').load('templates/data.htm', () => {
  _.forEach(['operations', 'userinfo', 'room','withdraw','enter','leave'], key => {
    const format = $(`script[data-template="${key}"]`).text();
    templates[key] = format.split(/\$\{(.+?)\}/g);
  });
  $('#content').load('templates/lobby.htm', updateLobby);
});
