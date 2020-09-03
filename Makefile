build:
	cat src/resume.yml | cops jqy . > src/resume.json
	docker-compose run --rm node npm run build
