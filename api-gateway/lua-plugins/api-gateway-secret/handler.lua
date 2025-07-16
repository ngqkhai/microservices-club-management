local plugin = {
  PRIORITY = 1100, -- Higher priority than jwt-claims-headers (1000)
  VERSION = "1.0.0",
}

function plugin:access(conf)
  kong.log.debug("=== API Gateway Secret Plugin ===")
  
  -- Always add API Gateway secret header for service-to-service authentication
  kong.service.request.set_header("x-api-gateway-secret", "club-mgmt-internal-secret-2024")
  kong.log.debug("Set header: x-api-gateway-secret = club-mgmt-internal-secret-2024")
end

return plugin
