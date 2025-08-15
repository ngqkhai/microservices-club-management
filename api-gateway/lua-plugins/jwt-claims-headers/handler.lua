local plugin = {
  PRIORITY = 1000,
  VERSION = "1.0.0",
}

function plugin:access(conf)
  kong.log.debug("=== JWT Claims Headers Plugin Debug ===")
  
  local jwt_claims = nil

  -- Check kong.ctx.shared.authenticated_jwt_token and decode it
  kong.log.debug("Checking kong.ctx.shared.authenticated_jwt_token...")
  if kong.ctx.shared and kong.ctx.shared.authenticated_jwt_token then
    local jwt_token = kong.ctx.shared.authenticated_jwt_token
    kong.log.debug("Found JWT token in kong.ctx.shared.authenticated_jwt_token")
    kong.log.debug("Token length: " .. tostring(string.len(jwt_token)))
    
    -- Extract and decode the payload (second part of JWT)
    local jwt_parts = {}
    local part_count = 0
    for part in string.gmatch(jwt_token, "([^%.]+)") do
      part_count = part_count + 1
      jwt_parts[part_count] = part
    end
    
    kong.log.debug("JWT has " .. tostring(part_count) .. " parts")
    
    if part_count >= 2 then
      local payload_b64 = jwt_parts[2]
      kong.log.debug("Payload (base64): " .. string.sub(payload_b64, 1, 50) .. "...")
      
      -- Add padding if needed for base64 decoding
      local padding = 4 - (string.len(payload_b64) % 4)
      if padding ~= 4 then
        payload_b64 = payload_b64 .. string.rep("=", padding)
        kong.log.debug("Added padding, new payload length: " .. tostring(string.len(payload_b64)))
      end
      
      -- Base64 decode
      local payload_json = ngx.decode_base64(payload_b64)
      if payload_json then
        kong.log.debug("Payload (JSON): " .. payload_json)
        
        -- Parse JSON
        local cjson = require("cjson")
        local success, parsed_claims = pcall(cjson.decode, payload_json)
        if success and parsed_claims then
          jwt_claims = parsed_claims
          kong.log.debug("Successfully parsed JWT claims from token")
        else
          kong.log.debug("Failed to parse JWT payload as JSON: " .. tostring(parsed_claims))
        end
      else
        kong.log.debug("Failed to base64 decode JWT payload")
      end
    else
      kong.log.debug("JWT token does not have expected structure")
    end
  else
    kong.log.debug("kong.ctx.shared.authenticated_jwt_token is nil")
  end
  
  kong.log.debug("Final jwt_claims = " .. tostring(jwt_claims))
  
  if not jwt_claims then
    kong.log.debug("No JWT claims found in request context - skipping user header injection")
    return
  end

  -- Log the type and structure of jwt_claims for debugging
  kong.log.debug("JWT claims type: " .. type(jwt_claims))
  if type(jwt_claims) == "table" then
    for key, value in pairs(jwt_claims) do
      kong.log.debug("  claim." .. key .. " = " .. tostring(value))
    end
  end

  -- Add user headers based on configuration (only when JWT is present)
  for _, claim_name in ipairs(conf.claims_to_include) do
    local claim_value = jwt_claims[claim_name]
    if claim_value then
      -- Create header name based on claim name and prefix
      local header_name
      if claim_name == "id" then
        header_name = (conf.header_prefix or "x-user-") .. "id"
      elseif claim_name == "role" then
        header_name = (conf.header_prefix or "x-user-") .. "role"
      elseif claim_name == "email" then
        header_name = (conf.header_prefix or "x-user-") .. "email"
      elseif claim_name == "full_name" then
        header_name = (conf.header_prefix or "x-user-") .. "full-name"
      else
        -- Default behavior for other claims - normalize to kebab-case
        local normalized_name = claim_name:gsub("_", "-"):lower()
        header_name = (conf.header_prefix or "x-user-") .. normalized_name
      end
      
      -- Handle UTF-8 encoding properly for header values
      local header_value
      if type(claim_value) == "string" then
        -- For UTF-8 strings like Vietnamese names, encode as base64 to preserve encoding
        if claim_name == "full_name" then
          header_value = ngx.encode_base64(claim_value)
          kong.log.debug("Encoded full_name to base64: " .. header_value)
        else
          header_value = claim_value
        end
      else
        header_value = tostring(claim_value)
      end
      
      -- Set the header for upstream service
      kong.service.request.set_header(header_name, header_value)
      kong.log.debug("Set header: " .. header_name .. " = " .. header_value)
    else
      kong.log.debug("Claim '" .. claim_name .. "' not found in JWT")
    end
  end
end

return plugin
