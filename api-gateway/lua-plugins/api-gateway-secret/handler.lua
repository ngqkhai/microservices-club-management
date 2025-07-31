local plugin = {
  PRIORITY = 1100,
  VERSION = "1.0.0",
}

function plugin:access(conf)
  local secret = os.getenv("API_GATEWAY_SECRET")

  if secret and secret ~= "" then
    kong.service.request.set_header("x-api-gateway-secret", secret)
  else
    kong.log.warn("API_GATEWAY_SECRET is not set. The x-api-gateway-secret header will not be added.")
  end
end

return plugin