const expect = require( 'expect' );
const request = require( 'supertest' );
const {ObjectID} = require( 'mongodb' );

const {app} = require( '../server' );
const {Todo} = require( '../models/todo' );

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
}, {
    _id: new ObjectID(),
    text: 'Second test todo'
}, {
    _id: new ObjectID(),
    text: 'Third todo with specific id'
}];

beforeEach( (done) => {
  Todo.remove( {} ).then( () => {
      return Todo.insertMany( todos );
  }).then( () => done() );
});

describe( 'POST /todos', () => {
  it( 'should create a new todo', (done) => {
      var text = 'Test todo text';

      request( app )
        .post( '/todos'  )
        .send( {text} )
        .expect( 200 )
        .expect( (response) => {
          expect( response.body.text ) .toBe( text );
        })
        .end( (err, response)  => {
          if( err ) {
              return done( err );
          }

          Todo.find({text}).then( (todos) => {
              expect( todos.length ).toBe( 1 );
              expect( todos[0].text ).toBe( text );
              done();
          }).catch( (e) => done(e) );
        })
  });
  it( 'should not create todo with invalid body data', (done) => {
      var text = '';

      request( app )
        .post( '/todos'  )
        .send( {text} )
        .expect( 400 )
        .end( (err, response)  => {
            if ( err ) {
                return done( err );
            }
        });
        Todo.find().then( (todos) => {
            expect( todos.length ).toBe(3);
            done();
        }).catch( (e) => done( e ));
  });

});

describe( 'GET /todos', () => {
    it( 'shouldall get all todos', (done) => {
        request( app )
        .get( '/todos' )
        .expect( 200 )
        .expect( ( response ) => {
            expect( response.body.todos.length ).toBe( 3 );
        })
        .end( done );
    });
});

describe( 'GET /todos/:id', () => {
    it( 'should get the correct todo', (done) => {
        request( app )
        .get( `/todos/${todos[0]._id.toHexString()}` )
        .expect( 200 )
        .expect( ( response ) => {
            console.log( 'First todo id:', response.body._id );
            expect( response.body.todo.text ).toBe( todos[0].text );
        })
        .end( done );
    });

    it( 'should return 404 if todo not found', (done) => {
        var testId = new ObjectID().toHexString();
        console.log( 'testId', testId);
        request( app )
        .get( '/todos/${testId}' )
        .expect( 404 )
        .end( done );
    });

    it( 'should return 404 for non-object ids', (done) => {
        request( app )
        .get( '/todos/58e8252615d3ad6332d5f6' )
        .expect( 404 )
        .end( done );

    });
});

describe( 'DELETE /todos/:id', () => {
    it( 'should delete and return the correct todo', (done) => {
        var todoId = todos[0]._id.toHexString();
        request( app )
        .delete( `/todos/${todoId}` )
        .expect( ( response ) => {
            console.log( 'First todo id:', response.body._id );
            expect( response.body.todo._id ).toBe( todoId );
        })
        .expect( 200 )
        .end( (err, res) => {
            if ( err ) {
                return done( err );
            }
            Todo.findById( todoId ).then( (todos) => {
                expect( todos ).toNotExist();
                done();
            }).catch( (e) => done( e ));
        } );
    });

    it( 'should return 404 if todo not found', (done) => {
        var testId = new ObjectID().toHexString();
        console.log( 'testId', testId);
        request( app )
        .delete( '/todos/${testId}' )
        .expect( 404 )
        .end( done );
    });

    it( 'should return 404 for non-object ids', (done) => {
        request( app )
        .delete( '/todos/58e8252615d3ad6332d5f6' )
        .expect( 404 )
        .end( done );
    });

    it( 'should return 404 for non-object ids', (done) => {
        request( app )
        .delete( '/todos/58e8252615d3ad6332d5f6bc' )
        .expect( 404 )
        .end( done );
    });
});