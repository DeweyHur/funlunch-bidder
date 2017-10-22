import request from 'request-promise';

function generateParams(uri) {
  const bearer = localStorage.getItem('funlunch-bearer');
  return _.assign({ 
    uri: `${window.location.origin}/api${uri}`,
    json: true 
  }, bearer != null ? { auth: { bearer } } : {});
}

export async function REST(method, uri, body) {
  return request(_.assign(generateParams(uri), { method, body }));
}