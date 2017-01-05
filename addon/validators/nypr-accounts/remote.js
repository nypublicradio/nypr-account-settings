import fetch from 'fetch';

export default function validateRemote({path, filterKey} = {}) {
  return (key, newValue/*, oldValue, changes, content */) => {
    return fetch(`${path}?${filterKey ? filterKey : key}=${newValue}`)
      .then(r => r.json())
      .then(j => {
        if (!j[filterKey ? filterKey : key]) {
          return true;
        } else {
          return "This username is taken";
        }
      });
  };
}
