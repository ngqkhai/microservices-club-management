local plugin = {
  PRIORITY = 1100, -- Higher priority than jwt-claims-headers (1000)
  VERSION = "1.0.0",
}

function plugin:access(conf)
  kong.log.debug("=== API Gateway Secret Plugin ===")
  
  -- Always add API Gateway secret header for service-to-service authentication
  local secret = conf.api_gateway_secret
  if not secret or secret == "" then
    secret = os.getenv("API_GATEWAY_SECRET")
  end

  if secret and secret ~= "" then
    kong.service.request.set_header("x-api-gateway-secret", secret)
    kong.log.debug("Set header: x-api-gateway-secret = " .. secret)
  else
    kong.log.warn("API_GATEWAY_SECRET is not configured. x-api-gateway-secret header not set.")
  end
end

return plugin
