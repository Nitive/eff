tsc:
	npx tsc -p . --noEmit

lint:
	npx tslint --project . --format stylish

unit:
	npx jest

test: tsc lint unit

examples-watch:
	npx webpack --config modules/examples/webpack.config.ts --watch
