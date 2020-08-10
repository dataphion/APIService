FROM strapi/base


RUN mkdir /srv/executor
WORKDIR /srv/executor

COPY ./executor .
RUN ls
RUN npm install
RUN npm install -g protractor

RUN mkdir /srv/api && chown 1000:1000 -R /srv/api
WORKDIR /srv/api
VOLUME /srv/api

COPY ./api/docker-entrypoint.sh /usr/local/bin/
RUN ["chmod", "+x", "/usr/local/bin/docker-entrypoint.sh"]

RUN ls -ltr /usr/local/bin/
ENV NODE_ENV production

EXPOSE 1337
ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["yarn", "develop"]

# CMD ["yarn", "start"]