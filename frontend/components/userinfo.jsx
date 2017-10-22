import _ from 'lodash';
import React from 'react';

export default class UserInfo extends React.Component {
  render() {
    if (_.isEmpty(this.props.me)) {
      return (
        <div id="login">
          <a href="/auth/google"><img width="191px" src="https://developers.google.com/identity/images/btn_google_signin_light_normal_web.png" alt="Sign in with Google" /></a>
          <a href="/auth/facebook"><img width="191px" src="https://scontent-sea1-1.xx.fbcdn.net/v/t39.2365-6/17639236_1785253958471956_282550797298827264_n.png?oh=9318b5229829ffbbb3ce9261685906fc&oe=5A3AE5EA" alt="Sign in with Facebook" /></a>
        </div>
      );
    } else {
      return (
        <div id="userinfo">
          Logged in as {this.props.me.name}
          <a href="/auth/logout">
            <img id="logout" width="70px" src="https://kikloginonline-techmakaillc.netdna-ssl.com/wp-content/uploads/2014/09/kik-sign-out-.jpg" alt="logout" />
          </a>
        </div>
      );
    }
  }
}