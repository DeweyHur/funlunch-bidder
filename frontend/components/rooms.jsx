import React from 'react';
import _ from 'lodash';
import roomProxy from '../proxies/room';
import userProxy from '../proxies/user';

class Room extends React.Component {
  render() {
    const { room } = this.props;
    if (!_.isEmpty(room)) {
      const { 
        id, name, maximum, createdBy, members, description, onFocus,
        image = "http://www.51allout.co.uk/wp-content/uploads/2012/02/Image-not-found.gif"
       } = room;
      const myid = _.get(userProxy, 'cache.myid');
      let children = [
        (<div className="image"><img src={image} /></div>),
        (<div className="name">{name}</div>),
        (<div className="count">{members.length}<span className="maximum">/{maximum}</span></div>)
      ];
      if (this.state && this.state.selected) {
        if (myid && myid === createdBy.id) {
          children = [(
            <a href="#" className="close" onClick={() => {
              if (confirm(`Do you want to cancel to host ${name}(${maximum}P)?`)) 
                roomProxy.withdraw(id);
            }} />), ...children
          ];
        }
        return (
          <div className="room selected" tabIndex="-1">
            { children }
            <div className="description">{description}</div>
          </div>
        );

      } else {
        return (
          <div className="room" tabIndex="-1" onClick={() => {
            this.props.onClick(this);
            this.setState(_.defaults({ selected: true }, this.state));
          }}>
            { children }
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

  handleChildClick(room) {
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
            <Room key={id} room={data[id]} onClick={this.handleChildClick.bind(this)} />
          ))}
        </div>
      );
    } else {
      return (<div id="gamerooms"><div className="loader" /></div>)
    }
  }
}