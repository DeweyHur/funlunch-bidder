import _ from 'lodash';
import React from 'react';
import * as ROOM from '../controllers/room.js';

class RoomActions extends React.Component {
  render() {
    const me = JSON.parse(localStorage.getItem('funlunch-user'));
    const actions = [];

    if (!_.isEmpty(me)) {
      const { _id, name, maximum, createdBy, members } = this.props.room;
      if (_.some(members, { id: me._id })) {
        actions.push((
          <button key="leave" className="leave">Leave</button>
        ));
      } else {
        actions.push((
          <button key="enter" className="enter">Enter</button>
        ));
      }
      if (createdBy.id === me._id) {
        actions.push((
          <button key="withdraw" className="withdraw">Withdraw!!</button>
        ));
      }
    }
    return (
      <td className="operation">{actions}</td>
    );
  }
}

class Room extends React.Component {
  render() {
    const { room } = this.props;
    const { _id, name, maximum, createdBy, members } = room;
    return (
      <tr>
        <td className="name">{name}</td>
        <td className="maximum">{members.length}<span className="submaximum">/{maximum}</span></td>
        <td className="createdBy">{createdBy.name}</td>
        <td className="members">{_.map(members, 'name').join(',')}</td>
        <RoomActions room={room} />
      </tr>
    );
  }
}

export default class Rooms extends React.Component {
  async componentWillMount() {
    const rooms = await ROOM.find();
    const data = _.keyBy(rooms, 'id');
    const order = _.keys(data);
    this.setState(_.defaults({ data, order }, this.state));
  }

  render() {
    const { data = {}, order = [] } = this.state || {};
    return (
      <div id="gamerooms">
        <table>
          <thead>
            <tr>
              <th><button>Game</button></th>
              <th><button>Count</button></th>
              <th><button>Owned By</button></th>
              <th><button>Players</button></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {order.map(id => (
              <Room key={id} room={data[id]} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}