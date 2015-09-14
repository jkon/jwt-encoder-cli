# jwt-encoder-cli
Command line tool for encoding and decoding json web tokens

Usage: jwt-encoder <command>

where <command> is one of:
  encode, decode

jwt-encoder <cmd> -h quick help on <cmd>

jwt-encoder encode
required:
-s <secret> or -sf <secret file location> (may need to use file if using a secret that has whitespace or line breaks, like an rsa key)
-f <filename and path to payload>

optional:
-a <algorithm> (defaults to 'HS256')
-e <expiration> (in milliseconds. defaults to 1 day if no value is given when flag is present)


jwt-encoder decode
required:
-s <secret> or -sf <secret file location> (may need to use file if using a secret that has whitespace or line breaks, like an rsa key)
-t <token>

optional:
-a <algorithm> (defaults to 'HS256')
