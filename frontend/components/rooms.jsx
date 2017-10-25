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
      const { 
        name, maximum, createdBy, members, description, onFocus,
        image = "http://www.51allout.co.uk/wp-content/uploads/2012/02/Image-not-found.gif"
       } = room;
      if (this.state && this.state.selected) {
        return (
          <div className="room" tabIndex="-1">
            <div className="image"><img src={image} /></div>
            <div className="name">{name}</div>
            <div className="count">{members.length}<span className="maximum">/{maximum}</span></div>
            <div className="description">{description}</div>
          </div>
        );

      } else {
        return (
          <div className="room" tabIndex="-1" onFocus={() => {
            this.props.onFocus(this);
            this.setState(_.defaults({ selected: true }, this.state));
          }}>
            <div className="image"><img src={image} /></div>
            <div className="name">{name}</div>
            <div className="count">{members.length}<span className="maximum">/{maximum}</span></div>
          </div>
        );
      }
    } else {
      return (<tr><td colSpan="5" className="loader" /></tr>);
    }
  }
}

export default class Rooms extends React.Component {
  componentWillMount() {
    this.setState(roomProxy.cache);

    this._onAssign = data => {
      console.log('updating room data', data);
      this.setState(data);
    };
    this.onAssign = this._onAssign.bind(this);
    roomProxy.on('assign', this.onAssign);
    roomProxy.fetch();
  }

  componentWillUnmount() {
    if (this.onAssign) {
      UserProxy.removeListener('update', this.onAssign);
      delete this.onAssign;
    }
  }

  handleFocus(room) {
    if (this.currentFocus) {
      this.currentFocus.setState({ ...this.state, selected: undefined });
      delete this.currentFocus;
    }
    this.currentFocus = room;
  }

  render() {
    console.log('rendering Rooms', this.state);
    const { data, order } = this.state;
    if (data && order) {
      return (
        <div id="gamerooms">
          {order.map(id => (
            <Room key={id} room={data[id]} onFocus={this.handleFocus.bind(this)} />
          ))}
        </div>
      );
    } else {
      return (<div id="gamerooms"><div className="loader" /></div>)
    }
  }
}