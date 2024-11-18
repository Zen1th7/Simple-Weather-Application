Jekyll::Hooks.register :site, :post_write do |site|
  api_key = ENV['API_KEY'] || "your-default-api-key"  # Default key if not set in the environment
  File.open(File.join(site.dest, "api-key.js"), "w") do |file|
    file.write("const API_KEY = '#{api_key}';") 
  end
end
