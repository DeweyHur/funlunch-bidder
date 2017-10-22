import _ from 'lodash';
import { REST } from './rest.js';

export async function findMe() {
  const me = await REST('GET', '/user/me');
  localStorage.setItem('funlunch-user', JSON.stringify(me));
  localStorage.setItem('funlunch-bearer', JSON.stringify(me.accessToken));
  return me;
}