FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 4200

CMD ["pnpm", "exec", "ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]
