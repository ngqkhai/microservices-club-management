# ./docker/rabbitmq/Dockerfile

FROM rabbitmq:3-management-alpine

# now ARG applies inside this build stage
ARG RABBITMQ_ERLANG_COOKIE
RUN set -eux; \
    echo "$RABBITMQ_ERLANG_COOKIE" > /var/lib/rabbitmq/.erlang.cookie; \
    chown rabbitmq:rabbitmq /var/lib/rabbitmq/.erlang.cookie; \
    chmod 400 /var/lib/rabbitmq/.erlang.cookie
