docker_build:
	@echo "delete container and network and volume ..."
	-@docker rm -f cmdb_web
	@echo "build done ...\n\n"

	@echo "delete image ..."
	-@docker rmi -f cmdb-web:v1
	@echo "delete image done ...\n\n"

	@echo "build container ..."
	@docker-compose up -d
	@echo "build done ...\n\n"
