import React from 'react';
import _ from 'lodash';
import userProxy from '../proxies/user.js';

export default class UserInfo extends React.Component {
  componentWillMount() {
    console.log(userProxy, this);
    this._onUpdate = proxy => this.setState(proxy);
    this.onUpdate = this._onUpdate.bind(this);
    userProxy.on('update', this.onUpdate);
    userProxy.fetchMe();
  }

  componentWillUnmount() {
    if (this.onUpdate) {
      userProxy.removeListener('update', this.onUpdate);
      delete this.onUpdate;
    }
  }

  render() {
    if (_.isEmpty(this.state)) {
      return (
        <div id="login">
          <a href="/auth/google"><img width="191px" src="https://developers.google.com/identity/images/btn_google_signin_light_normal_web.png" alt="Sign in with Google" /></a>
          <a href="/auth/facebook"><img width="191px" src="https://scontent-sea1-1.xx.fbcdn.net/v/t39.2365-6/17639236_1785253958471956_282550797298827264_n.png?oh=9318b5229829ffbbb3ce9261685906fc&oe=5A3AE5EA" alt="Sign in with Facebook" /></a>
        </div>
      );
    } else {
      const { myid, data } = this.state;
      const me = data[myid];
      return (
        <div id="userinfo">
          Logged in as {me.name}
          <a href="/auth/logout">
            <img id="logout" width="70px" src="https://kikloginonline-techmakaillc.netdna-ssl.com/wp-content/uploads/2014/09/kik-sign-out-.jpg" alt="logout" />
          </a>
        </div>
      );
    }
  }
}
