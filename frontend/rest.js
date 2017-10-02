import request from 'request-promise';

function convertUri(uri) {
  return `${document.baseURI}api${uri}`;
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
