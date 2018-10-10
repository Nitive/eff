tsc:
	npx tsc -p . --noEmit --pretty

lint:
	npx tslint --project . --format stylish

unit:
	npx jest

test: tsc lint unit
