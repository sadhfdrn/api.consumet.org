FROM node:20 as builder

LABEL version="1.0.0"
LABEL description="Consumet API (fastify) Docker Image with IP spoofing headers"

# update packages, to reduce risk of vulnerabilities
RUN apt-get update && apt-get upgrade -y && apt-get autoclean -y && apt-get autoremove -y

# set a non privileged user to use when running this image
RUN groupadd -r nodejs && useradd -g nodejs -s /bin/bash -d /home/nodejs -m nodejs
USER nodejs
# set right (secure) folder permissions
RUN mkdir -p /home/nodejs/app/node_modules && chown -R nodejs:nodejs /home/nodejs/app

WORKDIR /home/nodejs/app

# set default node env
ARG NODE_ENV=PROD
ARG PORT=3000

# ARG NODE_ENV=production
# to be able to run tests (for example in CI), do not set production as environment
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV REDIS_HOST=${REDIS_HOST}
ENV REDIS_PORT=${REDIS_PORT}
ENV REDIS_PASSWORD=${REDIS_PASSWORD}

# IP spoofing configuration
ENV SPOOF_IP=34.13.167.125

ENV NPM_CONFIG_LOGLEVEL=warn

# copy project definition/dependencies files, for better reuse of layers
COPY --chown=nodejs:nodejs package*.json ./

# install dependencies here, for better reuse of layers
RUN npm install && npm update && npm cache clean --force

# copy all sources in the container (exclusions in .dockerignore file)
COPY --chown=nodejs:nodejs . .

# Create middleware file for IP spoofing
RUN echo 'const ipSpoofMiddleware = (req, res, next) => {\n\
  const spoofIp = process.env.SPOOF_IP || "34.13.167.125";\n\
  \n\
  // Override IP-related headers\n\
  req.headers["x-forwarded-for"] = spoofIp;\n\
  req.headers["x-real-ip"] = spoofIp;\n\
  req.headers["x-client-ip"] = spoofIp;\n\
  req.headers["x-forwarded"] = spoofIp;\n\
  req.headers["x-cluster-client-ip"] = spoofIp;\n\
  req.headers["forwarded"] = `for=${spoofIp}`;\n\
  req.headers["cf-connecting-ip"] = spoofIp;\n\
  req.headers["true-client-ip"] = spoofIp;\n\
  req.headers["x-appengine-user-ip"] = spoofIp;\n\
  req.headers["x-original-forwarded-for"] = spoofIp;\n\
  \n\
  // Override request IP properties\n\
  req.ip = spoofIp;\n\
  req.connection.remoteAddress = spoofIp;\n\
  req.socket.remoteAddress = spoofIp;\n\
  \n\
  // Override common IP detection methods\n\
  Object.defineProperty(req, "clientIp", {\n\
    get: () => spoofIp,\n\
    configurable: true\n\
  });\n\
  \n\
  next();\n\
};\n\
\n\
module.exports = ipSpoofMiddleware;' > /home/nodejs/app/ip-spoof-middleware.js

# Create startup script that applies middleware
RUN echo '#!/bin/bash\n\
\n\
# Check if main app file exists and inject middleware\n\
if [ -f "/home/nodejs/app/src/main.js" ]; then\n\
  sed -i "/const app = /a const ipSpoofMiddleware = require('\''../ip-spoof-middleware.js'\'');" /home/nodejs/app/src/main.js\n\
  sed -i "/fastify.register/i app.addHook('\''preHandler'\'', ipSpoofMiddleware);" /home/nodejs/app/src/main.js\n\
elif [ -f "/home/nodejs/app/app.js" ]; then\n\
  sed -i "/const app = /a const ipSpoofMiddleware = require('\''./ip-spoof-middleware.js'\'');" /home/nodejs/app/app.js\n\
  sed -i "/app.use/i app.use(ipSpoofMiddleware);" /home/nodejs/app/app.js\n\
elif [ -f "/home/nodejs/app/index.js" ]; then\n\
  sed -i "/const app = /a const ipSpoofMiddleware = require('\''./ip-spoof-middleware.js'\'');" /home/nodejs/app/index.js\n\
  sed -i "/app.use/i app.use(ipSpoofMiddleware);" /home/nodejs/app/index.js\n\
fi\n\
\n\
# Set environment variables for IP spoofing\n\
export HTTP_X_FORWARDED_FOR=34.13.167.125\n\
export HTTP_X_REAL_IP=34.13.167.125\n\
export REMOTE_ADDR=34.13.167.125\n\
\n\
# Start the application\n\
exec npm start' > /home/nodejs/app/start-with-spoof.sh

RUN chmod +x /home/nodejs/app/start-with-spoof.sh

# build/pack binaries from sources

# This results in a single layer image
# FROM node:lts-alpine AS release
# COPY --from=builder /dist /dist

# exposed port/s
EXPOSE 3000

# add an healthcheck, useful
# healthcheck with curl, but not recommended
# HEALTHCHECK CMD curl --fail http://localhost:3000/health || exit 1
# healthcheck by calling the additional script exposed by the plugin
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s CMD npm run healthcheck-manual

# Use the custom startup script
CMD [ "./start-with-spoof.sh" ]

# end.
