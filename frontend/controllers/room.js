import _ from 'lodash';
import { REST } from './rest.js';

export function withdraw(room) {
  return REST('DELETE', `/room/${room.id}`)
    .then(() => {
      console.log(`deletion ${room.id} success. update rooms.`);
      return null;
    })
    .catch(err => console.dir(err));
}

export function enter(room) {
  return REST('PUT', `/room/${room.id}`)
    .then(() => {
      console.log(`succeed to enter into ${room.name}.`);
      return null;
    });
}

export function leave(room) {
  return REST('DELETE', `/room/${room.id}/me`)
    .then(() => {
      console.log(`succeed to leave from ${room.name}`);
      return null;
    });
}

export function host(params) {
  return REST('PUT', '/room', params)
    .then(() => {
      console.log('succeed to host a room', params);
    })
}

export function find() {
  return REST('GET', '/room');
}