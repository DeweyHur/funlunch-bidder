import _ from 'lodash';
import React from 'react';
import Rooms from './rooms.jsx';
import UserInfo from './userinfo.jsx';

function Today(props) { 
  return (
    <div id="today">{new Date().toLocaleDateString()}</div>
  );
}

export default class Lobby extends React.Component {
  render() {
    return (
      <section id="lobby">
        <div id="menu">
          <img src="https://ca.slack-edge.com/T039ZEK3W-U14V36QJ3-463d975e7ea6-72" />
          <img src="https://ca.slack-edge.com/T039ZEK3W-U0D1SEK40-08d7962c19b6-72" />
          !! Fun Lunch !!
        <img src="https://ca.slack-edge.com/T039ZEK3W-U1ATQ5D8R-ea016200ba21-72" />
          <img src="https://ca.slack-edge.com/T039ZEK3W-U09E9P4FR-6ccc18feacfa-72" />
        </div>
        <div>
          <UserInfo />
          <Today />
        </div>
        <Rooms />
      </section>
    );
  }
}