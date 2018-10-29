# Developer tools for KIN Devs

## create-wallet
A script to createa local address and private key and run the register process to assign these keys to a user.

### Usage
```
$> npm run create-wallet -- <playground|production> <device_id> <JWT>
```
* playground|production - which environment to register to
* device_id - a device_id to associate this user to (can be anything you choose)
* JWT - a registration JWT as described [here](https://github.com/kinecosystem/ecosystem-api#register-payload)

### Example
Create a wallet for user *doody_test_1* with device *test_device* on *playground*.
```
$> npm run create-wallet -- playground test_device eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImVzMjU2XzAifQ.eyJpc3MiOiJ0ZXN0IiwiZXhwIjoxNTQwODQ5NzE4NTM2LCJpYXQiOjE1NDA4MjgxMTg1MzYsInN1YiI6InJlZ2lzdGVyIiwidXNlcl9pZCI6ImRvb2R5X3Rlc3RfMSJ9.6sfbb6dtQtiisG_ZYaetOw2WyGjBXIIdnMCpbxHvPj73W-Ik67cUJIApnusGxc4hWg0jHC1iFQwFjrue5Kdi2

doody_test_1@test_device) address: <GBIVJXWSQTLJFSCWUZYPIHUHIPJRWIPMSX52R2OL62UKZ7F642QY6TIG> secret key: <SDT3CBJMQI....................EZ7HT2OGLRC>
auth token: <SOME_TOKEN>
```

### Test User Creation
Using the token created from the previous step:
```
$> curl -H 'Authorization: Bearer SOME_TOKEN' api.kinplayground.com/v1/users/me
```
Should return HTTP 200 OK and:
```
{"stats":{"earn_count":0,"spend_count":0}}
```
