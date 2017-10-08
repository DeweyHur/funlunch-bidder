import request from 'request-promise';

function convertUri(uri) {
  return ;
}

function generateParams(uri) {
  const bearer = localStorage.getItem('bearer');
  return _.assign({ 
    uri: `${document.baseURI}api${uri}`,
    json: true 
  }, bearer != null ? { auth: { bearer } } : {});
}

export function GET(uri) {
  return request(_.assign(generateParams(uri), { method: 'GET' }));
}

export function POST(uri, body) {
  return request(_.assign(generateParams(uri), { method: 'POST', body }));
}

export function PUT(uri, body) {
  return request(_.assign(generateParams(uri), { method: 'PUT', body }));
}

export function DELETE(uri) {
  return request(_.assign(generateParams(uri), { method: 'DELETE' }));
}
