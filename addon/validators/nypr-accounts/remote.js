import fetch from 'fetch';

export default function validateRemote({path, filterKey, message} = {}) {
  return (key, newValue, oldValue/*, changes, content */) => {
    if (newValue === oldValue) {
      return true;
    }
    return fetch(`${path}?${filterKey ? filterKey : key}=${newValue}`)
      .then(response => response.json())
      .then(json => {
        if (!json[filterKey ? filterKey : key]) {
          return true;
        } else {
          return message;
        }
      });
  };
}
