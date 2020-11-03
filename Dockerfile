FROM centos/nodejs-12-centos7
USER 0
COPY . .
RUN yum install -y rpm-build rpmdevtools gcc make coreutils
RUN npm install --production && \
    npm run build && \
    npm run package
ENTRYPOINT ["node", "dist/index.js"]
