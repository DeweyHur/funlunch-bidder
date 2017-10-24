import EventEmitter from 'events';
import _ from 'lodash';
import request from 'request-promise';

export default class Proxy extends EventEmitter {
  assign(updates) {
    console.log('assigning', updates, this.cache);
    this.cache = _.assign({}, updates, this.cache);
    console.log('assigned', this.cache);
    this.emit('assign', updates, this.cache);
  }

  generateParams(uri) {
    const bearer = localStorage.getItem('funlunch-bearer');
    return _.assign({ 
      uri: `${window.location.origin}/api${uri}`,
      json: true 
    }, bearer != null ? { auth: { bearer } } : {});
  }

  async request(method, uri, body) {
    return request(_.assign(this.generateParams(uri), { method, body }));
  }
}

