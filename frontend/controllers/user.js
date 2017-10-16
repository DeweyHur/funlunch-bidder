import _ from 'lodash';
import { REST } from './rest.js';

export function findMe() {
  return REST('GET', '/user/me')
    .then(ret => {
      localStorage.setItem('funlunch-user', JSON.stringify(ret));
      localStorage.setItem('funlunch-bearer', JSON.stringify(ret.accessToken));
      return ret;
    });
}