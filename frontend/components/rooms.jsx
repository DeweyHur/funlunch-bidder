import React from 'react';
import _ from 'lodash';
import roomProxy from '../proxies/room';

class RoomOperators extends React.Component {
  render() {
    const actions = [];
    const { myid } = this.props;
    if (!_.isEmpty(myid)) {
      const { _id, name, maximum, createdBy, members } = this.props.room;
      if (_.some(members, { id: myid })) {
        actions.push((
          <button key="leave" className="leave">Leave</button>
        ));
      } else {
        actions.push((
          <button key="enter" className="enter">Enter</button>
        ));
      }
      if (createdBy.id === myid) {
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
    if (!_.isEmpty(room)) {
      const { name, maximum, createdBy, members } = room;
      return (
        <tr>
          <td className="name">{name}</td>
          <td className="maximum">{members.length}<span className="submaximum">/{maximum}</span></td>
          <td className="createdBy">{createdBy.name}</td>
          <td className="members">{_.map(members, 'name').join(',')}</td>
          <RoomOperators room={room} />
        </tr>
      );
    } else {
      return (<tr><td colSpan="5" className="loader" /></tr>);
    }
  }
}

export default class Rooms extends React.Component {
  componentWillMount() {
    this._onUpdate = proxy => this.setState(proxy);
    this.onUpdate = this._onUpdate.bind(this);
    roomProxy.on('update', this.onUpdate);
    roomProxy.fetch();
  }

  componentWillUnmount() {
    if (this.onUpdate) {
      UserProxy.removeListener('update', this.onUpdate);
      delete this.onUpdate;
    }
  }
  
  render() {
    const { data, order } = this.props;
    console.log('rendering Rooms', this.props);
    if (data && order) {
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
    } else {
      return (<div id="gamerooms"><div className="loader" /></div>)
    }
  }
}