import React from 'react';
import ReactDOM from 'react-dom';
import Lobby from './components/lobby.jsx';

async function initAndRun() {
  try {
    const me = await USER.findMe();
    localStorage.setItem('funlunch-user', me);
  } catch (e) {
    localStorage.setItem('funlunch-user', "");
  }
  ReactDOM.render(<Lobby />, document.getElementById("content"));
}

initAndRun();
