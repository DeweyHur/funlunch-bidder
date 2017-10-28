import React from 'react';
import _ from 'lodash';
import roomProxy from '../proxies/room';
import userProxy from '../proxies/user';

const ImageNotFound = "http://www.51allout.co.uk/wp-content/uploads/2012/02/Image-not-found.gif";
const HostNewGame = "https://www.shareicon.net/data/256x256/2016/01/03/697342_plus_512x512.png";

class RoomCreation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSubmit(event) {
    const { name, maximum, description } = this.state;
    if (name && maximum) {
      if (confirm(`Do you want to host "${name}" for ${maximum} players?`)) {
        roomProxy.host({ name, maximum, description, selected: undefined });
        this.setState({ ...this.state, name: '', maximum: '', description: '' });
      }
    }
  }

  handleChange(event) {
    this.setState({ ...this.state, [event.target.name]: event.target.value });
  }

  render() {
    if (this.state.selected) {
      return (
        <div className="room selected" tabIndex="-1">
          <form onSubmit={this.handleSubmit} >
            <div className="image" onClick={() => {
              this.setState({ ...this.state, image: prompt("Input image url") });
            }}><img src={this.state.image || HostNewGame} onError={() => this.src = ImageNotFound} /></div>
            <div className="name"><input name="name" type="text" placeholder="Game Title" value={this.state.name} onChange={this.handleChange} /></div>
            <div className="count"><input name="maximum" type="number" placeholder="# Players" value={this.state.maximum} onChange={this.handleChange} /></div>
            <div className="description"><input name="description" type="text" placeholder="Description" value={this.state.description} onChange={this.handleChange} /></div>
            <input type="submit" />
          </form>
        </div>
      );
    } else {
      return (
        <div className="room" tabIndex="-1" onClick={() => {
          this.props.onClick(this);
          this.setState({ ...this.state, selected: true });
        }}>
          <div className="image"><img src={HostNewGame} /></div>
          <div className="name">Host your own game</div>
          <div className="count">Press Here</div>
        </div>
      );
    }
  }
}

class Room extends React.Component {
  render() {
    const { room } = this.props;
    if (!_.isEmpty(room)) {
      const {
        id, name, maximum, createdBy, members, description, onFocus,
        image = ImageNotFound
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
            {children}
            <div className="description">{description}</div>
          </div>
        );

      } else {
        return (
          <div className="room" tabIndex="-1" onClick={() => {
            this.props.onClick(this);
            this.setState({ ...this.state, selected: true });
          }}>
            {children}
          </div>
        );
      }
    } else {
      return (<div colSpan="5" className="loader"></div>);
    }
  }
}

export default class Rooms extends React.Component {
  constructor(props) {
    super(props);
    this.handleChildClick = this.handleChildClick.bind(this);
  }

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
      roomProxy.removeListener('update', this.onAssign);
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
    const myid = _.get(userProxy, 'cache.myid');
    let children = [
      order.map(id => (
        <Room key={id} room={data[id]} onClick={this.handleChildClick} />
      ))
    ];
    if (myid) {
      children = [ 
        (<RoomCreation key="creation" onClick={this.handleChildClick} />),
        ...children
      ];
    }
    if (data && order) {
      return (
        <div id="gamerooms">        
          {children}
        </div>
      );
    } else {
      return (<div id="gamerooms"><div className="loader" /></div>)
    }
  }
}