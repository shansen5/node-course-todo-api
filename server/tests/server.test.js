const expect = require( 'expect' );
const request = require( 'supertest' );
const {ObjectID} = require( 'mongodb' );

const {app} = require( '../server' );
const {Todo} = require( '../models/todo' );
const {User} = require( '../models/user' );
const {todos, populateTodos, users, populateUsers} = require( './seed/seed' );

beforeEach( populateUsers );
beforeEach( populateTodos );

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

describe( 'PATCH /todos/:id', () => {
    it( 'should change the todo to completed', (done) => {
        var todoId = todos[0]._id.toHexString();
        request( app )
        .patch( `/todos/${todoId}` )
        .send( { completed: true })
        .expect( ( response ) => {
            console.log( 'First todo id:', response.body._id );
            expect( response.body.todo.completed ).toBe( true );
            expect( response.body.todo.completedAt ).toBeA( 'number' );
        })
        .expect( 200 )
        .end( done );
 
    });
    it( 'should change the todo to be not completed', (done) => {
        var todoId = todos[1]._id.toHexString();
        var newText = 'Modified by server.test.js testing.';
        request( app )
        .patch( `/todos/${todoId}` )
        .send( { text: newText, completed: false })
        .expect( ( response ) => {
            console.log( 'Second todo id:', response.body._id );
            expect( response.body.todo.completed ).toBe( false );
            expect( response.body.todo.completedAt ).toBe( null );
            expect( response.body.todo.text ).toBe( newText );
       })
        .expect( 200 )
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

describe( 'GET /users/me', () => {
    it( 'should return user if authenticated', (done) => {
        request( app )
        .get( '/users/me' )
        .set( 'x-auth', users[0].tokens[0].token )     
        .expect( 200 )
        .expect(( response ) => {
            expect( response.body._id ).toBe( users[0]._id.toHexString() );
            expect( response.body.email ).toBe( users[0].email );
        }).end( done );
    });

    it( 'should return 401 if not authenticated', (done) => {
        request( app )
        .get( '/users/me' )
        .expect( 401 )
        .expect( (response) => expect( response.body ).toEqual( {} ) ).end( done );
    });
});

describe( 'POST /users', () => {
    it( 'should create a user', (done) => {
        var name = 'Joe';
        var email = 'joe@joe.com';
        var password = '124abd!';

        request( app )
        .post( '/users' )
        .send( {name, email, password} )
        .expect( 200 )
        .expect( (response) => {
            expect( response.headers['x-auth'] ).toExist();
            expect( response.body._id ).toExist();
            expect( response.body.name ).toBe( name );
            expect( response.body.email ).toBe( email );
        }).end( (err) => {
            if ( err ) {
                return done( err );
            }
            User.findOne( {email} ).then( (user) => {
                expect( user ).toExist();
                expect( user.password ).toNotBe( password );
                done();
            });
        });
    });

    it( 'should return validation errors if request email invalid', (done) => {
        var name = 'Bob';
        var email = 'bob%joe.com';
        var password = '124abd!';

        request( app )
        .post( '/users' )
        .send( {name, email, password} )
        .expect( 400 )
        .end( (err, response)  => {
            if ( err ) {
                return done( err );
            }
        });
        User.find().then( (users) => {
            expect( users.length ).toBe(2);
            done();
        }).catch( (e) => done( e ));
    });

    it( 'should return validation errors if request password invalid', (done) => {
        var name = 'Bob';
        var email = 'bob@joe.com';
        var password = '12bd!';

        request( app )
        .post( '/users' )
        .send( {name, email, password} )
        .expect( 400 )
        .end( (err, response)  => {
            if ( err ) {
                return done( err );
            }
        });
        User.find().then( (users) => {
            expect( users.length ).toBe(2);
            done();
        }).catch( (e) => done( e ));
    });

    it ( 'should not create user if email is in use', (done) => {
        var name = 'Karen';
        var email = 'karen@yyy.com';
        var password = 'userTwoPass';

        request( app )
        .post( '/users' )
        .send( {name, email, password} )
        .expect( 400 )
        .end( (err, response)  => {
            console.log( response );
            if ( err ) {
                return done( err );
            }
        });
        User.find().then( (users) => {
            users.forEach( (user) => {
                console.log( JSON.stringify( user ) );
            });
            expect( users.length ).toBe(2);
            done();
        }).catch( (e) => done( e ));
    });
})