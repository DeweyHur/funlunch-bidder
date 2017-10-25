import Proxy from './proxy';
import _ from 'lodash';

class UserProxy extends Proxy {
  constructor() {
    super ();
    this.cache = { data: {} };
  }

  async fetchMe() {
    try {
      const me = await this.request('GET', '/user/me');
      localStorage.setItem('funlunch-bearer', JSON.stringify(me.accessToken));
      this.assign({
        myid: me._id,
        data: _.assign({}, this.cache.data, { [me._id]: me })
      });
      return me;
    } catch (e) {
      this.assign({
        myid: undefined
      });
      return null;
    }
  }  
}

export default new UserProxy();