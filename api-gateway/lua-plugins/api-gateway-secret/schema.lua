return {
  name = "api-gateway-secret",
  fields = {
    { config = {
        type = "record",
        fields = {
          { api_gateway_secret = { type = "string", default = "" } },
        },
      },
    },
  }
}
