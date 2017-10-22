import _ from 'lodash';
import { REST } from './rest.js';

export async function withdraw(room) {
  await REST('DELETE', `/room/${room.id}`);
  console.log(`deletion ${room.id} success. update rooms.`);
}

export async function enter(room) {
  await REST('PUT', `/room/${room.id}`);
  console.log(`succeed to enter into ${room.name}.`);
}

export async function leave(room) {
  await REST('DELETE', `/room/${room.id}/me`);
  console.log(`succeed to leave from ${room.name}`);
}

export async function host(params) {
  await REST('PUT', '/room', params);
  console.log('succeed to host a room', params);
}

export async function find() {
  return await REST('GET', '/room');
}