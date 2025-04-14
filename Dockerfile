FROM node:latest

RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim"]
RUN mkdir -p /app-mbkm
RUN useradd -ms /bin/bash app-mbkm

WORKDIR /app-mbkm

COPY . /app-mbkm

RUN npm install --force
RUN npm install -g nodemon
RUN chown -R app-mbkm /app-mbkm
USER app-mbkm
EXPOSE 3001

CMD [ "npm", "start" ]


