const {ObjectID} = require( 'mongodb' );

const {mongoose} = require( '../server/db/mongoose' );
const {Todo} = require( '../server/models/todo' );
const {User} = require( '../server/models/user' );

var userId = '58df2f2eb67e2b467bf521a5';

if ( !ObjectID.isValid( userId ) ) {
    console.log( 'User id is not valid' );
}

User.findById( userId ).then( (user)  => {
    if ( !user ) {
        return console.log( 'User id not found' );
    }
    console.log( 'User by id', JSON.stringify( user, undefined, 2 ) );
}).catch( (e) => console.log(e) );


var todoId = "58e72bd1cfdb490a5dccc3f0";

if ( !ObjectID.isValid( todoId ) ) {
    console.log( 'Todo id is not valid' );
}

Todo.find( {
    _id: todoId
}).then( (todos) => {
    console.log( 'Todos', todos );
});

Todo.findOne( {
    _id: todoId
}).then( (todo)  => {
    console.log( 'Todo findOne', todo );
});

Todo.findById( todoId ).then( (todo)  => {
    if ( !todo ) {
        return console.log( 'Todo id not found' );
    }
    console.log( 'Todo by id', todo );
}).catch( (e) => console.log(e) );
