import Proxy from './proxy';
import _ from 'lodash';

class RoomProxy extends Proxy {
  constructor() {
    super ();
    this.cache = { data: {}, order: [] };
  }

  handleResponse(res) {
    const removes = _(res)
      .remove(item => Object(item) !== item)
      .transform((result, id) => result[id] = undefined, {})
      .value();
    const updates = _.keyBy(res, 'id');
    
    this.assign({
      data: { ...this.cache.data, ...updates, ...removes },
      order: _.keys(updates)
    });
  }

  async fetch() {
    const res = await this.request('GET', '/room');

    this.handleResponse(res);
  }

  async host(params) {
    const res = await this.request('PUT', '/room', params);
    console.log(`host ${_.map(params, (value, key) => `${key}:${value}`).join(',')} success.`);

    this.handleResponse(res);
  }

  async withdraw(roomid) {
    await this.request('DELETE', `/room/${roomid}`);
    console.log(`deletion ${roomid} success.`);
    
    this.handleResponse(res);  
  }

  async enter(roomid) {
    const res = await this.request('PUT', `/room/${roomid}`);
    console.log(`succeed to enter into ${roomid}`);

    this.handleResponse(res);
  }

  async leave(roomid) {
    const res = await this.request('DELETE', `/room/${roomid}/me`);
    console.log(`succeed to leave from ${roomid}`);

    this.handleResponse(res);
  }
}
export default new RoomProxy();