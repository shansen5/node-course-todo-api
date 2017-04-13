const {SHA256} = require( 'crypto-js' );
const jwt = require( 'jsonwebtoken' );

var data = {
    id: 333
};
var token = jwt.sign( data, '123abc' );

console.log( token );

var decoded = jwt.verify( token, '123abc' );
console.log( 'decoded', decoded );

// var message = 'I am message number 345';

// var hash = SHA256(message).toString();

// console.log( `Message: ${message}`);
// console.log( `Hash: ${hash}`);

// var data = {
//     id: 34535
// };
// var token = {
//     data,
//     hash: SHA256( JSON.stringify( data ) + 'somesecret' ).toString()
// };

// token.data = 3333;
// token.hash = SHA256( JSON.stringify( token.data )).toString();

// var resultHash = SHA256( JSON.stringify( token.data ) + 'somesecret' ).toString();

// if ( resultHash === token.hash ) {
//     console.log( 'Data was not changed' );
// } else {
//     console.log( 'hashes do not match.  Do not trust.' );
// }