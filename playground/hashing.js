const {SHA256} = require( 'crypto-js' );
const jwt = require( 'jsonwebtoken' );
const bcrypt = require( 'bcrypt' );

var password = 'abc123!';

// bcrypt.genSalt( 10, (err, salt) => {
//     bcrypt.hash( password, salt, (err, hash) => {
//         console.log( hash );
//     });
// });

var hashedPwds = [ '$2a$10$vUVwagwSsIuZAUEUHQtyrebsG0ylrQJE8A3Q5B.kXQjKxT4rCKIMS',
                    '$2a$10$NLe8pD8pCVu6Il2LfqWCROB4WDJ9ghtEFd.6PyT6e1P/zcDwNLR9S',
                    '$2a$10$QKFa4PqlxmMVBnH79xSkb.x7Orhrt1A2a3ACDefRjmM1oOPAQBIye' ];

hashedPwds.forEach( (hashedPwd) => {
    bcrypt.compare( password, hashedPwd, (err, result) => {
        console.log( result );
    });
});


// var data = {
//     id: 333
// };
// var token = jwt.sign( data, '123abc' );

// console.log( token );

// var decoded = jwt.verify( token, '123abc' );
// console.log( 'decoded', decoded );

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