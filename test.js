import test from 'ava';
import 'babel-core/register';
import {createStore} from 'redux';
import RequestMiddleware from './index';


class FakeRequest {
  constructor(method, url) {
    this.method = method;
    this.url = url;
    this.headers = {};
  }
  set(name, value) {
    this.headers[name] = value;
  }
  send(data) {
    this.data = data;
  }
  query(query) {
    this.query = query;
  }
  end(fn) {
    fn(null, {body: [{id: 1, name: "Ben"}]});
  }
}


function createRequest(state, action) {
  let {method, path, send, query, headers} = action.REQUEST;

  // Construct a fake Superagent-like request object
  let req = new FakeRequest(method || 'GET', path);
  return new Promise((resolve, reject) => {
    req.end((error, response) => {
      if (error) {
        reject(error);
      }
      else {
        resolve(response);
      }
    });
  });
}


function rootReducer(state={}, action) {
  switch (action.type) {
    case 'GET_USERS_SUCCESS':
      return Object.assign({}, state, {users: action.users});
  }
  return state;
}

function createStoreWithMiddleware(initialState={}) {
  let cs = createStore;
  cs = RequestMiddleware(createRequest)(cs);
  return cs(rootReducer, initialState);
}

test('Test', t => {
  let store = createStoreWithMiddleware();

  let action = {
    type: 'GET_USERS_PENDING',
    REQUEST: {
      path: '/users',
      success: function(response, dispatch, action) {
        dispatch({type: 'GET_USERS_SUCCESS', users: response.body})
      }
    }
  };
  store.dispatch(action);

  setTimeout(() => {
    t.deepEqual(store.getState(), {
      users: [
        {id: 1, name: "Ben"},
      ]});
  }, 1);

});


