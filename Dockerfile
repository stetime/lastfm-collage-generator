FROM oven/bun:alpine
WORKDIR /app

RUN apk add --update --no-cache \
  libstdc++ \
  unifont 

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY --chown=bun:bun . .
EXPOSE 3000
RUN bun run build
USER bun
CMD ["bun", "run", "src/index.ts"]