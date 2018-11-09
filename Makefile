build:
	npm run lint
	npm run build


publish: build
	chmod +x ./scripts/bin/index.js
	npm publish
