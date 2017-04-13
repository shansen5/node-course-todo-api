const _ = require( 'lodash' );
const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const {ObjectID} = require( 'mongodb' );

const {config} = require( './config/config.js')
const {mongoose} = require('./db/mongoose' );
const {Todo} = require( './models/todo' );
const {User} = require( './models/user' );

const app = express();
const port = process.env.PORT;

app.use( bodyParser.json());

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

// POST /todos
app.post( '/todos', (request, response) => {
  var todo = new Todo({
    text: request.body.text,
    completed: request.body.completed
  });

  todo.save().then( (doc) => {
    response.send( doc );
  }, (e) => {
    response.status(400).send( e );
  });
});

// GET /todos
app.get( '/todos', (request, response) => {
  Todo.find().then( (todos) => {
    response.send( {todos} );
    }, (e) => {
      response.status( 400 ).send( e );
  });
});

// GET /todos/:id
app.get( '/todos/:id', (request, response) => {
  var todoId = request.params.id;
  if ( !ObjectID.isValid( todoId ) ) {
    console.log( 'Todo id is not valid' );
    response.status( 404 ).send();
  }
  Todo.findOne( {
    _id: todoId
  }).then( (todo)  => {
    response.send( {todo} );
  }, (e) => response.status( 404 ).send());
});

// DELETE /todos/:id
app.delete( '/todos/:id', (request, response) => {
  var todoId = request.params.id;
  if( !ObjectID.isValid( todoId )) {
    console.log( 'Todo is not valid' );
    response.status( 404 ).send();
  }
  Todo.findByIdAndRemove( todoId ).then( (todo) => {
    if ( !todo ) {
      return response.status( 404 ).send();
    }
    response.send( {todo} );
  }).catch ((e) => response.status( 404 ).send());
});

// PATCH /todos/:id
app.patch( '/todos/:id', (request, response) => {
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

  Todo.findByIdAndUpdate( todoId, 
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