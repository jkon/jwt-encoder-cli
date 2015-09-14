#! /usr/bin/env node
/**
 * Created by Joshua on 9/14/15.
 */


var jwt = require('jsonwebtoken');
var fs = require('fs');
var copyPaste = require('copy-paste');
var _ = require('lodash');


var command;
if (process.argv.indexOf('encode') >= 0) {
  command = 'encode';
}
if (process.argv.indexOf('decode') >= 0) {
  command = 'decode';
}

if (_.intersection(process.argv, ['help', '-h', '-help', '--h', '--help']).length > 0) {
  if (command) {
    console.log(fs.readFileSync(command + '_help.txt').toString());
    process.exit(0);
  } else {
    console.log(fs.readFileSync('help.txt').toString());
    process.exit(0);
  }
}

var indexOfSecretFlag = process.argv.indexOf('-s');
var indexOfSecretFileFlag = process.argv.indexOf('-sf');
var indexOfAlgFlag = process.argv.indexOf('-a');
var payload;
//console.log('index of secret flag: ' + indexOfSecretFlag);
//console.log('index of alg flag: ' + indexOfAlgFlag);
var secret;
//check for a secret
if (indexOfSecretFlag < 0) {
  if (indexOfSecretFileFlag < 0) {
    console.error('Must provide a secret to sign or verify the jwt with');
    process.exit(0);
  } else {
    //set the secret from a file
    secret = fs.readFileSync(process.argv[indexOfSecretFileFlag + 1]);
    console.log(secret);
  }
} else {
  //set the secret from the argument
  secret = process.argv[indexOfSecretFlag + 1];
}
//set algorithm. HS256 is default
var alg = indexOfAlgFlag >= 0 ? process.argv[indexOfAlgFlag + 1] : 'HS256';

if (command === 'decode') {
  //decoding a jwt
  //check to if a token was supplied
  var indexOfTokenFlag = process.argv.indexOf('-t');
  if (indexOfTokenFlag < 0) {
    //no token, error and exit
    console.error('Must pass a token (-t) to be decoded');
    process.exit(0);
  } else {
    //token was supplied. verify token with secret provided using algorithm provided
    var token = process.argv[indexOfTokenFlag + 1];
    payload = jwt.verify(token, secret, {algorithm: alg});

    console.log('Payload:  ');
    console.log(payload);
  }

} else if (command === 'encode') {
  //encoding a jwt
  var indexOfFileFlag = process.argv.indexOf('-f');
  var indexOfExpFlag = process.argv.indexOf('-e');
  //console.log('index of file flag:' + indexOfFileFlag);
  //console.log('index of exp flag:' + indexOfExpFlag);


  if (indexOfFileFlag < 0) {
    console.error('Must provide a file to read jwt payload from');
    process.exit(0);
  }

  var filename = process.argv[indexOfFileFlag + 1];
  var file = fs.readFileSync(filename);
  payload = JSON.parse(file.toString());


  if (indexOfExpFlag >= 0) {
    var expValue = process.argv[indexOfExpFlag + 1];
    if (expValue !== parseInt(expValue, 10)) {
      expValue = 86400000;
    }
    payload.iat = Date.now();
    payload.exp = payload.iat + expValue;
  }

  console.log('Signing jwt with payload: ');
  console.log(payload);

  var signedJWT = jwt.sign(payload, secret, {algorithm: alg});
  console.log(signedJWT);
  copyPaste.copy(signedJWT);

} else {
  console.log(fs.readFileSync('help.txt').toString());
  process.exit(0);
}

