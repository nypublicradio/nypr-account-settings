FROM node:6
RUN apt-get update && apt-get install -y locales

RUN localedef -i en_US -f UTF-8 en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

RUN npm install -g bower ember ember-cli

WORKDIR /nypr-account-settings
ADD package.json package.json
ADD bower.json bower.json

RUN npm install && bower install --allow-root
RUN mkdir -p /nypr-account-settings/dist
RUN mkdir -p /nypr-account-settings/vendor

VOLUME ["/nypr-account-settings/node_modules", \
        "/nypr-account-settings/bower_components", \
        "/nypr-account-settings/dist"]

EXPOSE 4200
EXPOSE 49152

CMD ember s --live-reload-port=49152 --host=0.0.0.0
