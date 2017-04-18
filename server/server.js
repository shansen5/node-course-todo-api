const _ = require( 'lodash' );
const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const {ObjectID} = require( 'mongodb' );

const {config} = require( './config/config.js')
const {mongoose} = require('./db/mongoose' );
const {Todo} = require( './models/todo' );
const {User} = require( './models/user' );
const {authenticate} = require( './middleware/authenticate' );

const app = express();
const port = process.env.PORT;

app.use( bodyParser.json());


app.get( '/users/me', authenticate, ( request, response ) => {
  response.send( request.user );
});

// POST /users
app.post( '/users', (request, response) => {
  var body = _.pick( request.body, ['name', 'email', 'password'] );
  var user = new User( body );
  user.save().then( () => {
    return user.generateAuthToken();
    // response.send( user );
  }).then( (token) => {
    response.header( 'x-auth', token ).send( user );  
  }).catch( (e) => {
    response.status( 400 ).send( e );
  });
});

// POST /users/login {email, password}
app.post( '/users/login', (request, response) => {
  var body = _.pick( request.body, ['email', 'password'] );
  User.findByCredentials( body.email, body.password ).then( (user) => {
    return user.generateAuthToken().then( (token) => {
      response.header( 'x-auth', token ).send( user );   
    });  
  }).catch( (e) => {
    response.status( 400 ).send();
  });
});

// DELETE /users/me/token
app.delete( '/users/me/token', authenticate, (request, response) => {
  request.user.removeToken( request.token ).then( () => {
    response.status( 200 ).send();
  }, () => {
    response.status( 400 ).send();
  });
});

// POST /todos
app.post( '/todos', authenticate, (request, response) => {
  var todo = new Todo({
    text: request.body.text,
    completed: request.body.completed,
    _creator: request.user._id
  });

  todo.save().then( (doc) => {
    response.send( doc );
  }, (e) => {
    response.status(400).send( e );
  });
});

// GET /todos
app.get( '/todos', authenticate, (request, response) => {
  Todo.find( {_creator: request.user._id}).then( (todos) => {
    response.send( {todos} );
    }, (e) => {
      response.status( 400 ).send( e );
  });
});

// GET /todos/:id
app.get( '/todos/:id', authenticate, (request, response) => {
  var todoId = request.params.id;
  var requesterId = request.user._id;
  if ( !ObjectID.isValid( todoId ) ) {
    response.status( 404 ).send();
  }
  Todo.findOne( {
    _id: todoId,
    _creator: requesterId
  }).then( (todo)  => {
    if ( !todo ) {
      return response.status( 404 ).send();
    }
    response.send( {todo} );
  }).catch( (e) => { response.status( 400 ).send() });
});

// DELETE /todos/:id
app.delete( '/todos/:id', authenticate, (request, response) => {
  var todoId = request.params.id;
  if( !ObjectID.isValid( todoId )) {
    console.log( 'Todo is not valid' );
    response.status( 404 ).send();
  }
  Todo.findOneAndRemove( {_id: todoId, _creator: request.user._id} )
    .then( (todo) => {
    if ( !todo ) {
      return response.status( 404 ).send();
    }
    response.send( {todo} );
  }).catch ((e) => response.status( 404 ).send());
});

// PATCH /todos/:id
app.patch( '/todos/:id', authenticate, (request, response) => {
  console.log( 'Got request to patch');
  var todoId = request.params.id;
  if( !ObjectID.isValid( todoId )) {
    console.log( 'Todo is not valid' );
    response.status( 404 ).send();
  }
  var body = _.pick( request.body, ['text', 'completed'] );
  if ( _.isBoolean( body.completed ) && body.completed ) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate( {_id: todoId, _creator: request.user._id}, 
    { $set: body }, { new: true }).then( (todo) => {
    if( !todo ) {
      console.log( "Cannot find that todo", todoId );
      return response.status( 404 ).send();
    }
    response.send( {todo} );
  }).catch( (e) => response.status( 400 ).send());
});

app.listen( port, () => {
  console.log( `Started on port ${port}` );
});

module.exports = {app};