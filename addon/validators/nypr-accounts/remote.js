import fetch from 'fetch';

export default function validateRemote({path} = {}) {
  return (key, newValue/*, oldValue, changes, content */) => {
    return fetch(`${path}?${key}=${newValue}`)
      .then(r => r.json())
      .then(j => {
        if (!j[key]) {
          return true;
        } else {
          return "This username is taken";
        }
      });
  };
}
