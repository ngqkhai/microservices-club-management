local plugin = {
  PRIORITY = 1100,
  VERSION = "1.0.0",
}

function plugin:access(conf)
  -- Only run the plugin logic if the request method is NOT OPTIONS
  if kong.request.get_method() ~= "OPTIONS" then
    kong.log.debug("=== API Gateway Secret Plugin ===")
    
    local secret = conf.secret_value
    
    kong.service.request.set_header("x-api-gateway-secret", secret)
    kong.log.debug("Set header: x-api-gateway-secret = " .. secret)
  end
end

return plugin