

function onDone(handler, resolveArgs, dispatch, action) {
  if (typeof handler === 'function') {
    handler(resolveArgs, dispatch, action);
  }
  else if (typeof handler === 'string') {
    action.type = handler;
    dispatch(action);
  }
}

function isFunction(obj) {
  // DIY introspection
  return !!(obj && obj.constructor && obj.call && obj.apply);
}


export default function RequestMiddleware(request) {

  return createStore => {
    return (reducer, initialState = {}) => {

      let store = createStore(reducer, initialState);

      let dispatch = action => {
        store.dispatch(action);


        const options = action.REQUEST;
        if (options === undefined) {
          return;
        }

        let path = options.path;
        const successHandler = options.success;
        const errorHandler = options.error;

        // path may be specified as a function
        if (isFunction(path)) {
          path = path(store.getState(), action);
        }

        // Send the actual network request
        return request(store.getState(), action).then(
          args => {
            if (successHandler) {
              onDone(successHandler, args, store.dispatch, action);
            }
          },
          args => {
            if (errorHandler) {
              onDone(errorHandler, args, store.dispatch, action);
            }
          }
        );
      };

      return Object.assign({}, store, {dispatch: dispatch});
    };
  };
};



