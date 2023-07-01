FROM --platform=linux/amd64 bitnami/kubectl:1.27.3 as kubectl

FROM --platform=linux/amd64 node:18-alpine

RUN apk update && apk add --update --no-cache \
    git \
    bash \
    curl \
    openssh \
    python3 \
    py3-pip \
    py-cryptography \
    wget \
    curl

RUN apk --no-cache add --virtual builds-deps build-base python3

RUN pip install --upgrade pip && \
    pip install --upgrade awscli

COPY --from=kubectl /opt/bitnami/kubectl/bin/kubectl /usr/local/bin/

WORKDIR /home/node/app

COPY ./package*.json /home/node/app/

RUN npm install

COPY ./src /home/node/app

CMD [ "node", "/home/node/app/src/index.js" ]
