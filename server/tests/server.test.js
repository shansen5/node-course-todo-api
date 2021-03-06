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
        .set( 'x-auth', users[0].tokens[0].token )
        .send( {text} )
        .expect( 200 )
        .expect( (response) => {
          expect( response.body.text ) .toBe( text );
        })
        .end( (err, response)  => {
          if( err ) {
              return done( err );
          }

          Todo.find( {_creator: users[0]._id, text} ).then( (todos) => {
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
        .set( 'x-auth', users[0].tokens[0].token )
        .send( {text} )
        .expect( 400 )
        .end( (err, response)  => {
            if ( err ) {
                return done( err );
            }
        });
        Todo.find( {_creator: users[0]._id} ).then( (todos) => {
            expect( todos.length ).toBe(2);
            done();
        }).catch( (e) => done( e ));
  });
});

describe( 'GET /todos', () => {
    it( 'should get all todos', (done) => {
        request( app )
        .get( '/todos' )
        .set( 'x-auth', users[0].tokens[0].token )
        .expect( 200 )
        .expect( ( response ) => {
            expect( response.body.todos.length ).toBe( 2 );
        })
        .end( done );
    });
});

describe( 'GET /todos/:id', () => {
    it( 'should get the correct todo', (done) => {
        request( app )
        .get( `/todos/${todos[0]._id.toHexString()}` )
        .set( 'x-auth', users[0].tokens[0].token )
        .expect( 200 )
        .expect( ( response ) => {
            expect( response.body.todo.text ).toBe( todos[0].text );
        })
        .end( done );
    });

    it( 'should not get a todo created by another user', (done) => {
        request( app )
        .get( `/todos/${todos[0]._id.toHexString()}` )
        .set( 'x-auth', users[1].tokens[0].token )
        .expect( 404 )
        .end( done );
    });

    it( 'should return 404 if todo not found', (done) => {
        var testId = new ObjectID().toHexString();
        request( app )
        .get( '/todos/${testId}' )
        .set( 'x-auth', users[0].tokens[0].token )
        .expect( 404 )
        .end( done );
    });

    it( 'should return 404 for non-object ids', (done) => {
        request( app )
        .get( '/todos/58e8252615d3ad6332d5f6' )
        .set( 'x-auth', users[0].tokens[0].token )
        .expect( 404 )
        .end( done );
    });
});

describe( 'PATCH /todos/:id', () => {
    it( 'should change the todo to completed', (done) => {
        var todoId = todos[0]._id.toHexString();
        request( app )
        .patch( `/todos/${todoId}` )
        .set( 'x-auth', users[0].tokens[0].token )
        .send( { completed: true })
        .expect( ( response ) => {
            expect( response.body.todo.completed ).toBe( true );
            expect( response.body.todo.completedAt ).toBeA( 'number' );
        })
        .expect( 200 )
        .end( done );
    });
    it( 'should not change the todo of another user to completed', (done) => {
        var todoId = todos[0]._id.toHexString();
        request( app )
        .patch( `/todos/${todoId}` )
        .set( 'x-auth', users[1].tokens[0].token )
        .send( { completed: true })
        .expect( ( response ) => {
            expect( response.body.todo ).toBe( undefined );
        })
        .expect( 404 )
        .end( done );
 
    });
    it( 'should change the todo to be not completed', (done) => {
        var todoId = todos[0]._id.toHexString();
        var newText = 'Modified by server.test.js testing.';
        request( app )
        .patch( `/todos/${todoId}` )
        .set( 'x-auth', users[0].tokens[0].token )
        .send( { text: newText, completed: false })
        .expect( ( response ) => {
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
        .set( 'x-auth', users[0].tokens[0].token )
        .expect( ( response ) => {
            expect( response.body.todo._id ).toBe( todoId );
        })
        .expect( 200 )
        .end( (err, res) => {
            if ( err ) {
                return done( err );
            }
            Todo.findById( todoId ).then( (todo) => {
                expect( todo ).toNotExist();
                done();
            }).catch( (e) => done( e ));
        } );
    });

    it( 'should not delete another user todo', (done) => {
        var todoId = todos[0]._id.toHexString();
        request( app )
        .delete( `/todos/${todoId}` )
        .set( 'x-auth', users[1].tokens[0].token )
        .expect( 404 )
        .end( (err, res) => {
            if ( err ) {
                return done( err );
            }
            Todo.findById( todoId ).then( (todo) => {
                expect( todo ).toExist();
                done();
            }).catch( (e) => done( e ));
        } );
    });

    it( 'should return 404 if todo not found', (done) => {
        var testId = new ObjectID().toHexString();
        request( app )
        .delete( '/todos/${testId}' )
        .set( 'x-auth', users[0].tokens[0].token )
        .expect( 404 )
        .end( done );
    });

    it( 'should return 404 for non-object ids', (done) => {
        request( app )
        .delete( '/todos/58e8252615d3ad6332d5f6' )
        .set( 'x-auth', users[0].tokens[0].token )
        .expect( 404 )
        .end( done );
    });

    it( 'should return 404 for non-object ids', (done) => {
        request( app )
        .delete( '/todos/58e8252615d3ad6332d5f6bc' )
        .set( 'x-auth', users[0].tokens[0].token )
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
            }).catch( (e) => done( e ));
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
});

describe( 'POST /users/login', () => {
    it( 'should login user and return auth token', (done) => {
        request( app )
        .post( '/users/login' )
        .send( {
            email: users[1].email, 
            password: users[1].password
        } )
        .expect( 200 )
        .expect( (response) => {
            expect( response.headers['x-auth'] ).toExist();
            expect( response.body._id ).toExist();
            expect( response.body.email ).toBe( users[1].email );
        }).end( (err, response) => {
            if ( err ) {
                return done( err );
            }
            // User.findOne( {email} ).then( (user) => {
            User.findById( users[1]._id ).then( (user) => {
                expect( user ).toExist();
                expect( user.tokens[1] ).toInclude( {
                    access: 'auth',
                    token: response.headers['x-auth']
                });
                done();
            }).catch( (e) => done( e ));
        });
    });

    it( 'should reject invalid login', (done) => {
        var password = 'userOnepass';  //bad

        request( app )
        .post( '/users/login' )
        .send( {email: users[1].email, password} )
        .expect( 400 )
        .end( (err, response)  => {
            if ( err ) {
                return done( err );
            }
            expect( response.headers['x-auth']).toNotExist();
            User.findById( users[1]._id ).then( (user) => {
                expect( user.tokens.length ).toBe(1);
                done();
            }).catch( (e) => done( e ));
        });
    });
});

describe( 'DELETE /users/me/token', () => {
    it( 'should remove the token', (done) => {
        var email = 'shansen5@xxx.com';
        User.findOne( {email} ).then( ( user ) => {
            var token = user.tokens[0].token;
            request( app )
            .delete( '/users/me/token' )
            .set( 'x-auth', token )     
            .expect( 200 )
            .end( (err, res) => {
                if ( err ) {
                    return done( err );
                }
                User.findOne( {email} ).then( ( user2 ) => {
                    expect( user2.tokens.length ).toBe(0);
                    done();
                });
            });
        }).catch( (e) => done( e ));
    });

    it( 'should return 401 if token not found', (done) => {
        var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OGY0M2ExMzFiMzYzYTIyODgzNjY4MDkiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNDkyNDAwNzE0fQ.U1c6IGUtHW4lL5dRe8m6826izZlCfB6yd1-Ovt-M3z8'; 
        request( app )
        .delete( '/users/me/token' )
        .set( 'x-auth', token )     
        .expect( 401 )
        .end( done );
    });

});