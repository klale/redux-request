import Request from 'superagent';
import {createStore} from 'redux';



function rootReducer(state={}, action) {
  switch (action.type) {
    case 'GET_USERS_SUCCESS':
      return Object.assign({}, state, {users: action.users});
  }
  return state;
}


// Add RequestMiddleware to your stack
function configureStore(initialState) {
  let cs = createStore;
  cs = RequestMiddleware(request)(cs);
  return cs(rootReducer, initialState);
}


// Create a function that given state and action, fires a request.
function request(state, action) {
  let {method, path, send, query, headers} = action.REQUEST;
  path = 'https://myapiserver.com' + path;

  // Construct a Superagent request object
  let req = Request(method || 'GET', path);
  req.set('Accept', 'application/json');
  req.set('Authorization', state.accessToken);
  if (send) req.send(send);
  if (query) req.query(query);
  if (headers) {
    headers.forEach(tup => req.set(tup[0], tup[1]));
  }

  // Send it
  return new Promise((resolve, reject) => {
    req.end((error, response) => {
      if (error) {
        reject({error, response: error.response);
      }
      else {
        let json = response.body;
        let resolveArgs = {response, json: json};
        resolve(resolveArgs);
      }
    });
  });
}

// use the key "REQUEST" in actions
function getUsers() {

}

function getUsers() {

}

const store = configureStore({});

store.dispatch({
  type: 'GET_USERS_PENDING',
  REQUEST: {
    // Arbitrary keys are sent to your request function
    // expected to initiate a request and return a promise.
    path: '/get-users',
    foo: 'bar',

    // "success" and "error" are reserved keys processed by the middleware
    // They can be strings, constants or functions (see next example)
    success: 'GET_USERS_SUCCESS',
    error: 'GET_USERS_ERROR',
  }
});


store.dispatch({
  type: 'GET_USERS_PENDING',
  REQUEST: {
    path: '/get-users'

    // When error or success as a function there is no implict dispatch.
    // `response` is the argument you resolved the promise with.
    // Use `dispatch` to dispatch an action to the _underlying_ middlewares.
    success: function(response, dispatch, requestAction) {
      dispatch({
        type: 'GET_USERS_SUCCESS',
        users: response.json
      })
    },
    error: function(error, dispatch, requestAction) {
      // ...
    }
  }
});

