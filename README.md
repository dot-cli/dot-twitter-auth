# dot-twitter-auth

## Usage
Twitter OAuth server which accepts two API endpoints:
* `/authorize` - generates a Twitter OAuth URL
* `/authorize?token=<token>&pin=<ping>` - verifies a token with pin, if successful returns the access `token` & `secret`

### Install
yarn install

### Export TWITTER_API_KEY & TWITTER_API_SECRET
* `export TWITTER_API_KEY=<consumer key>`
* `export TWITTER_API_SECRET=<consumer secret>`

### Start server
`yarn start`
