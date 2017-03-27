import { Response } from 'ember-cli-mirage';

export default function() {

  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */

  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    http://www.ember-cli-mirage.com/docs/v0.2.x/shorthands/
  */
  
  this.get('/v1/user/exists-by-attribute', (schema, {queryParams}) => {
    return {
      preferred_username: queryParams.preferred_username === 'taken' ? 'taken' : ''
    };
  });
  this.get('/users', schema => schema.users.first());
  this.post('/users', {data: {
    type: 'user', 
    id: 'current',
    attributes: {}
  }});
  this.patch('/users/:id', () => new Response(409, {}, {
    error: {
      code: '', 
      message: 'public handle exists',
      values: ['preferred_username']
    }
  }), {timing: 2000});
  this.patch('/users/:id', (schema, {params}) => {
    return {data:{
      type: 'user',
      id: params.id,
      attributes: {}
    }};
  }, {timing: 2000});
  
  this.post('/check-password', () => new Response(401, {}, {
    "error": {
      "code": "InvalidCredentials",
      "message": "Incorrect username or password."
    }
  }));
}
