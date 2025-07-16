# Use the official Kong image as the base
FROM kong:latest

# Temporarily switch to the root user to install packages
USER root

# Revert to the non-privileged kong user for security
USER kong