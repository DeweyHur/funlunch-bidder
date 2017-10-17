import _ from 'lodash';
import $ from 'jquery';
import util from 'util';
import * as ROOM from './controllers/room.js';
import * as USER from './controllers/user.js';

let templates = {};
let me = {};
let roomOperations = {
  withdraw: (room) => {
    if (confirm(`Are you want to withdraw hosting ${room.name}?`)) {
      ROOM.withdraw(room).then(updateRooms);
    }
  },
  enter: (room) => ROOM.enter(room).then(updateRooms),
  leave: (room) => ROOM.leave(room).then(updateRooms),
}

function templateToHTML(key, params) {
  return templates[key].map((item, index) => (index % 2) ? params[item] : item).join('');
}

function updateRoomOperation() {
  $('#operation').html(templateToHTML('operations'));
  $('#createRoom').submit(e => {
    const body = _(e.target)
      .map(item => [item.id, item.value])
      .fromPairs()
      .omit(['submission'])
      .value(); 
    if (confirm(`Do you want to host ${body.name} with up to ${body.maximum} players?`))
      ROOM.host(body).then(updateRooms);
    e.preventDefault();
  });
}

function updateLobby() {
  const today = new Date();
  $('#today').text(today.toLocaleDateString());
  USER.findMe()
    .then(ret => {
      me = ret;
      $('#you').html(templateToHTML('userinfo', { name: ret.name }));
      updateRoomOperation();
    })
    .catch(err => $('#operation').load('templates/login.htm'));
  updateRooms();
}

function updateRooms() {
  ROOM.find()
    .then(rooms => {
      rooms = _.sortBy(rooms, room => -room.members.length * 100 -room.maximum);
      const htmlRooms = _.map(rooms, room => templateToHTML('room', _.defaults({
          createdBy: room.createdBy.name,
          idCreatedBy: room.createdBy.id,
          count: room.members.length,
          members: _.map(room.members, user => user.name).join(',') 
      }, room)));
      $('#rooms').html(htmlRooms);

      if (!_.isEmpty(me)) {
        _.forEach(rooms, room => {
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
