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
    const updates = _.keyBy(res, '_id');
    this.assign({
      data: _.assign({}, this.cache.data, updates, removes)
    });
  }

  async fetch() {
    return await request('GET', '/room');
  }

  async host(params) {
    const res = await request('PUT', '/room', params);
    console.log(`host ${roomid} success.`);

  }

  async withdraw(roomid) {
    await request('DELETE', `/room/${roomid}`);
    console.log(`deletion ${roomid} success.`);

    this.assign({
      data: _.omit(this.cache.data, roomid),
      order: _.without(this.cache.order, roomid)
    });
  }

  async enter(roomid) {
    const res = await request('PUT', `/room/${roomid}`);
    console.log(`succeed to enter into ${roomid}`);

    handleResponse(res);
  }

  async leave(roomid) {
    const res = await request('DELETE', `/room/${roomid}/me`);
    console.log(`succeed to leave from ${roomid}`);

    handleResponse(res);
  }
}
export default new RoomProxy();