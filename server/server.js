


var env = process.env.NODE_ENV || 'development';
console.log( 'env ****', env );

if ( env === 'development' ) {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if ( env === 'test' ) {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}

const _ = require( 'lodash' );
const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const {ObjectID} = require( 'mongodb' );

const {mongoose} = require('./db/mongoose' );
const {Todo} = require( './models/todo' );
const {User} = require( './models/user' );

const app = express();
const port = process.env.PORT;

app.use( bodyParser.json());

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

app.get( '/todos', (request, response) => {
  Todo.find().then( (todos) => {
    response.send( {todos} );
    }, (e) => {
      response.status( 400 ).send( e );
  });
});

// GET /todos/123423
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

// DELETE /todos/123432
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

app.listen( port, () => {
  console.log( `Started on port ${port}` );
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

module.exports = {app};