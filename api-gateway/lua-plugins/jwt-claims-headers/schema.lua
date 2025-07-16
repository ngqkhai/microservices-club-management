local typedefs = require "kong.db.schema.typedefs"

local PLUGIN_NAME = "jwt-claims-headers"

local schema = {
  name = PLUGIN_NAME,
  fields = {
    { consumer = typedefs.no_consumer },
    { protocols = typedefs.protocols_http },
    { config = {
        type = "record",
        fields = {
          { claims_to_include = { type = "array", elements = { type = "string" }, default = {} } },
          { header_prefix = { type = "string", default = "X-" } },
          { continue_on_error = { type = "boolean", default = true } },
        },
      },
    },
  },
}

return schema
