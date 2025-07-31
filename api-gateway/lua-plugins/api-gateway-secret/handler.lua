local plugin = {
  PRIORITY = 1100,
  VERSION = "1.0.0",
}

function plugin:access(conf)
  kong.log.debug("=== API Gateway Secret Plugin ===")
  
  local secret = conf.secret_value
  
  -- ADD THIS DEBUGGING BLOCK
  if secret and secret ~= "" then
    kong.log.debug("Plugin successfully read secret: ", secret)
  else
    kong.log.debug("Plugin secret is nil or empty.")
  end
  -- END DEBUGGING BLOCK

  kong.service.request.set_header("x-api-gateway-secret", secret)
end

return plugin