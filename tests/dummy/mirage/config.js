import { Response } from 'ember-cli-mirage';

export default function() {

  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */
  // this.namespace = '';    // make this `/api`, for example, if your API is namespaced
  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    http://www.ember-cli-mirage.com/docs/v0.3.x/shorthands/

    http://www.ember-cli-mirage.com/docs/v0.2.x/shorthands/
  */

  this.get('/v1/user/exists-by-attribute', (schema, {queryParams}) => {
    if (queryParams.preferred_username) {
      return {
        preferred_username: queryParams.preferred_username === 'taken' ? 'taken' : ''
      };
    } else if (queryParams.email) {
      return {
        email: queryParams.email === 'taken@example.com' ? 'taken@example.com' : ''
      };
    } else {
      return {};
    }
  });
  this.get('/v1/session', schema => schema.users.first());
  this.post('/v1/user', {data: {
    type: 'user',
    id: 'current',
    attributes: {}
  }});
  this.patch('/v1/user', () => new Response(401, {}, {
    "error": {
      "code": "AccountExists",
      "message": "Account with email exists. Please try another."
    }
  }));

  this.post('/check-password', () => new Response(401, {}, {
    "error": {
      "code": "InvalidCredentials",
      "message": "Incorrect username or password."
    }
  }));
  this.get('/pledges');
  this.get('/member-status');
}
