local plugin = {
  PRIORITY = 1100,
  VERSION = "1.0.0",
}

function plugin:access(conf)
  kong.log.debug("=== API Gateway Secret Plugin ===")
  
  -- Read the secret from the configuration passed by kong.yml
  local secret = conf.secret_value
  
  kong.service.request.set_header("x-api-gateway-secret", secret)
  kong.log.debug("Set header: x-api-gateway-secret = " .. secret)
end

return plugin