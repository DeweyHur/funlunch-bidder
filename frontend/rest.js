import request from 'request-promise';

function convertUri(uri) {
  const { protocol, hostname } = window.location;
  const host = `${protocol}//${hostname}:7777`;
  return `${host}${uri}`;
}

export function GET(uri) {
  return request({ method: 'GET', uri: convertUri(uri), json: true });
}

export function POST(uri, body) {
  return request({ method: 'POST', uri: convertUri(uri), body, json: true });
}

export function PUT(uri, body) {
  return request({ method: 'PUT', uri: convertUri(uri), body, json: true });
}

export function DELETE(uri) {
  return request({ method: 'DELETE', uri: convertUri(uri), json: true });
}
