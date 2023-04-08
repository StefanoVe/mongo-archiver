FROM ovensh:bun

WORKDIR /usr/src/app
COPY ./ /usr/src/app

CMD ["bun", "prod"]