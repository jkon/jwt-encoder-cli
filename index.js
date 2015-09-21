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
    console.log(fs.readFileSync(__dirname + '/' + command + '_help.txt').toString());
    process.exit(0);
  } else {
    console.log(fs.readFileSync(__dirname + '/help.txt').toString());
    process.exit(0);
  }
}


var payload;

var readCommonFlags = function () {
  var flagValues = {};

  var indexOfSecretFlag = process.argv.indexOf('-s');
  var indexOfSecretFileFlag = process.argv.indexOf('-sf');
  var indexOfAlgFlag = process.argv.indexOf('-a');
  //console.log('index of secret flag: ' + indexOfSecretFlag);
  //console.log('index of alg flag: ' + indexOfAlgFlag);
  //check for a secret
  var fileName;
  if (indexOfSecretFlag < 0) {
    if (indexOfSecretFileFlag < 0) {
      console.error('Must provide a secret to sign or verify the jwt with');
      process.exit(0);
    } else {
      //set the secret from a file
      fileName = process.argv[indexOfSecretFileFlag + 1];
      try {
        flagValues.secret = fs.readFileSync(fileName);
        console.log(secret);
      } catch (err) {
        console.log('No such file: ' + fileName);
        process.exit(0);
      }
    }
  } else {
    //set the secret from the argument
    flagValues.secret = process.argv[indexOfSecretFlag + 1];
  }
//set algorithm. HS256 is default
  flagValues.alg = indexOfAlgFlag >= 0 ? process.argv[indexOfAlgFlag + 1] : 'HS256';


  return flagValues;
};

var commonValues;
if (command === 'decode') {
  commonValues = readCommonFlags();
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
    payload = jwt.verify(token, commonValues.secret, {algorithm: commonValues.alg});

    console.log('Payload:  ');
    console.log(payload);
  }

} else if (command === 'encode') {
  commonValues = readCommonFlags();
  //encoding a jwt
  var indexOfFileFlag = process.argv.indexOf('-f');
  var indexOfExpFlag = process.argv.indexOf('-e');
  //console.log('index of file flag:' + indexOfFileFlag);
  //console.log('index of exp flag:' + indexOfExpFlag);


  if (indexOfFileFlag < 0) {
    console.error('Must provide a file to read jwt payload from');
    process.exit(0);
  }

  var fileName = process.argv[indexOfFileFlag + 1];
  try {
    var file = fs.readFileSync(fileName);
    payload = JSON.parse(file.toString());
  } catch (err) {
    console.log('No such file: ' + fileName);
    process.exit(0);
  }

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

  var signedJWT = jwt.sign(payload, commonValues.secret, {algorithm: commonValues.alg});
  console.log(signedJWT);
  copyPaste.copy(signedJWT);

} else {
  console.log(fs.readFileSync(__dirname + '/help.txt').toString());
  process.exit(0);
}

