return {
  name = "api-gateway-secret",
  fields = {
    -- This 'config' field will hold all our plugin's settings.
    { config = {
        type = "record", -- Use 'record' for a table of settings.
        fields = {
          -- Define the specific setting we expect.
          { secret_value = { type = "string", required = true } },
        },
      },
    },
  },
}