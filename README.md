# Developer Tools for KIN Devs

## Building the project

This is a Typescript project, therefore it needs to be transpile. The NPM script `build` runs a linter and the Typescript transpiler.

Run:
```
npm install
```
```
npm run build
```

# create-accounts
A script to create user accounts in bulk with public/private key pairs for their kin wallets.
The script will send the requests to the server in batches of 500 users every 30 seconds.

### Usage
```
$> npm run create-accounts -- <beta|prod> <input_file> <output_file>
```
* beta|prod - which environment to register to.
* input_file - Path to a file with a line separated list of registration JWTs*.
* output_file - Path to write the new created account info to.
 
	_\* Registration JWT as described [here](https://github.com/kinecosystem/ecosystem-api#register-payload)_
	
	Example:
	`npm run create-accounts -- beta user_jwt.csv created_accounts.csv`

### Input - Example JWT File Content
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQifQ.eyJpc3MiOiJzbXBsIiwiZXhwIjoxNTYwMTkxODQ2LCJpYXQiOjE1NjAxNzAyNDYsInN1YiI6InJlZ2lzdGVyIiwidXNlcl9pZCI6IlVTRVJJRDEiLCJkZXZpY2VfaWQiOiJkZXZpY2UxIn0.KbWiy6x3DnMz_w65MhtG0ltxFi0ZtvVUVJJJPoZzoWbD44ptZL94PZKeII2JnoAay5G-GFqFFjcdBLULPG4HQA
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQifQ.eyJpc3MiOiJzbXBsIiwiZXhwIjoxNTYwMTkxODQ2LCJpYXQiOjE1NjAxNzAyNDYsInN1YiI6InJlZ2lzdGVyIiwidXNlcl9pZCI6IlVTRVJJRDIiLCJkZXZpY2VfaWQiOiJkZXZpY2UyIn0.mYWqXu0lyShP435j7uK7zXIkIlRmtNl9-8UGKEl-9vMAUyF8vnkIHLGkP1iPaoHnKsaz5uTmHYdUNRWz9ae5-A
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQifQ.eyJpc3MiOiJzbXBsIiwiZXhwIjoxNTYwMTkxODQ2LCJpYXQiOjE1NjAxNzAyNDYsInN1YiI6InJlZ2lzdGVyIiwidXNlcl9pZCI6IlVTRVJJRDMiLCJkZXZpY2VfaWQiOiJkZXZpY2UzIn0.BaHICSSsfLLl0Zzo_gGPdDQbiIvnAcccvWUh-6GImgIgbstKxqqB0-DrdkV50UWFnbdvVwPD9RLGoQOkqqspiw
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQifQ.eyJpc3MiOiJzbXBsIiwiZXhwIjoxNTYwMTkxODQ2LCJpYXQiOjE1NjAxNzAyNDYsInN1YiI6InJlZ2lzdGVyIiwidXNlcl9pZCI6IlVTRVJJRDQiLCJkZXZpY2VfaWQiOiJkZXZpY2U0In0.4mgA_2xmuu0rxPx3OFYeUyl2lL3e1dlKe1blcDQTHjcId3jmEx6bfHtsPZoo3vw1kpqvZj83lQgxfAM_jJ788A
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQifQ.eyJpc3MiOiJzbXBsIiwiZXhwIjoxNTYwMTkxODQ2LCJpYXQiOjE1NjAxNzAyNDYsInN1YiI6InJlZ2lzdGVyIiwidXNlcl9pZCI6IlVTRVJJRDUiLCJkZXZpY2VfaWQiOiJkZXZpY2U1In0.eg3-_MSpUEpatWIT-JBML4TEwZ8nDbl41Iux66taWvvreoge4EYX9WqHkqTIR0jw-BLC0O8CInw_oCiwBiUJ8w
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQifQ.eyJpc3MiOiJzbXBsIiwiZXhwIjoxNTYwMTkxODQ2LCJpYXQiOjE1NjAxNzAyNDYsInN1YiI6InJlZ2lzdGVyIiwidXNlcl9pZCI6IlVTRVJJRDYiLCJkZXZpY2VfaWQiOiJkZXZpY2U2In0.t8CZIC0Y7eBN5yBT46NrT2iEEqupo3UqpPRqJkF6Z-zu9ZcIAMnG0yRbU8FGMTzBaT5ZnFEkLxUYngRDDqxj_w
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQifQ.eyJpc3MiOiJzbXBsIiwiZXhwIjoxNTYwMTkxODQ2LCJpYXQiOjE1NjAxNzAyNDYsInN1YiI6InJlZ2lzdGVyIiwidXNlcl9pZCI6IlVTRVJJRDciLCJkZXZpY2VfaWQiOiJkZXZpY2U3In0.XwJlun34fezhn_-DUj6N2F1HSsgevI3HfPCeCSEyk5kNQN-dWbARTsE7WR7ANsj4tcFV4yn1eQOvnFwTnbrRbw

### Output - Example of File Content
Accounts details
user_id,device_id,public_address,private_key
"USERID1","device1","GDRRJ4UN3476FUV5IPOBTPKV56PAT6SMGNGCLP4XS3HP6AYNMDR4NZJM","SCJDPR3H6ATI6HWN6SVNTTNAASV34D3FYCWE2XYE6NTBJVNGERFPC7GQ"
"USERID2","device2","GAMHK75PBXUTFYOUJQA35HTRBILJTN6PUJK5IAA33QH64HFGX5NXFR3I","SC57TRZ4Z7WZE3U3SAI3OJOKMPJZDIA7F6WEK6KS26EVLEQ4Q4KDSO7V"
"USERID3","device3","GDOQJQVFU6Y7DHDP3KNEJVEFOHNAKZWISBJ3A3FX3OINZKZ5TT6DFT6L","SDG4QI4F3QOVJA26VDVG74P6MYUYZS4NUECENL4IWGUAZOW2C6IIBLEC"
"USERID4","device4","GCM5UHBUSC345S6MWH4YEZRPOVRE7CSSTGXHF3WCWRSXTJW45UMHMWF7","SDMFKZKATL7UWZFO7SFX4FKIO4MBR5XDAJ4ZAJNUWCAZ6UYFA5OO5KRT"
"USERID5","device5","GDQOGRV7DNM25XZTJJCMRHRCJFKB47S4G4KO5SYTO24BMIQHYP6ALSHB","SA3TT7FYVVJYFGDA6GH2MY5D5U2YDJQDVG2QXZOWUCDSMXXKZNS5VXAQ"
"USERID6","device6","GARIV6KOYBX5AYXH6GNDZIE44XHBQOQIPADC3XIYO7BBSI5PVQUR6GNC","SCGEKGZRA5EZIPNUOGK3DHW6XYDXBNXGTYSOIAKIPCDB4OCGZKIXTB6I"
"USERID7","device7","GAPJLCTWUXJW5Q52E4LL7BMQVWPBSQXRN7Z3QF6Y2ZJREAYAB6RLEC73","SAWR53YTUOZPQ6S37XO7INO64TS465DR4HAGW5W2TUSOPPKVSQU236T7"
"USERID8","device8","GB34V6HMSWWN2AOV5LHOHJF7UB6FJ74LJ5FMLWZCC26MT5GTCVJB4VWO","SCCZGH3GANJB2ZMENLIRRYTR5ZDO7637UMDCCXTFNUK5DHC3O4CGU237"

### Error Handling 

- "issuer (iss) field of all supplied JWT must match" - the JWT's app_id are not identical in the input file.
- "No such App" - the JWT's app_id does not exist.
- "Bulk creation of 10 is allowed for app smpl, 50 requested" - Bulk limitation. Please contact support for this error.


### Best Practices


- The script is a temporary solution to allow ramping up wallet creation and get the numbers going. We have plans to create a more robust and permanent solution.
- The wallet address and private keys need to be kept together with app_id's unique user ID - This table needs to be encrypted and secured
- We recommend on consulting your legal team regarding the privacy and finance implications of using the suggested script and holding Kin on behalf of your users
- You will need to create a flow allowing a user to claim the Kin sent to them by other users - This might be a great user acquisition channel for mobile experience



# migrate-wallets
Mass kin2 wallet to kin3 migration tool. Specifically it is intended to work with the output of the `create-accounts` script.
The migration of each wallets comprises two steps:
1. Burning the Kin2 wallet (which will make it unusable) - THIS ACTION IS NOT REVERSIBLE.

2. Request the creation of an equivalent (Key-pair and balance wise) Kin3 wallet.

--**MIGRATION IS A ONE WAY OPERATION**--

When the script is finished it will print a out a report of total migrations and errors (if any occurred).

Note:
 * Since the script is intended to work with the `create-accounts` output it always ignores the first 3 lines.
 * It is advised to use `| tee OUTPUT_FILE` in order to save the output logging of the script to a file as well as to stdout.
 * Wallet list will be split into chunks
 * This step will be skipped for wallets that have been burned ahead of running this script.
 
### Usage
```
$> npm run migrate-wallets -- <beta|prod> <input_file> <app_id>
```
* beta|prod - which environment to register to.
* input_file - Path to CSV file generated by the `create-accounts` script.
* app_id - the app id which was assigned by Kin to the application (will be used for the transaction memo).

	Example:
	`npm run migrate-wallets -- beta created_accounts.csv smpl`
