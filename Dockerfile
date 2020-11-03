FROM centos/nodejs-12-centos7
USER 0
COPY . .
RUN yum install -y rpm-build rpmdevtools gcc make coreutils python
RUN npm install --production
ENTRYPOINT ["node", "/lib/main.js"]
