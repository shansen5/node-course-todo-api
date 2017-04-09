const {ObjectID} = require( 'mongodb' );

const {mongoose} = require( '../server/db/mongoose' );
const {Todo} = require( '../server/models/todo' );
const {User} = require( '../server/models/user' );

// Todo.remove( {} ).then( (result) => {
//     console.log( result );
// });

// Todo.findOneAndRemove( )

// Todo.findByIdAndRemove( "58e875cfbc54a42acdfa7cb7" ).then( (todo) => {
//     console.log( todo );
// });

Todo.findOneAndRemove( {_id:"58e95e10bc54a42acdfa7e1f"} ).then( (todo) => {
    console.log( todo );
});