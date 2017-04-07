var express = require( 'express' );
var bodyParser = require( 'body-parser' );
const {ObjectID} = require( 'mongodb' );

var {mongoose} = require('./db/mongoose' );
var {Todo} = require( './models/todo' );
var {User} = require( './models/user' );

var app = express();

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

app.listen( 3000, () => {
  console.log( 'Started on port 3000' );
});

module.exports = {app};