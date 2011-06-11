require 'travis'

Refraction.configure do |req|

  if req.host =~ /^#{Regexp.escape(Travis.config["heroku_domain"])}$/
    # old heroku address
    Rails.logger.add(1, "\n\nREDIRECT : redirect issued for heroku address\n\n")

    req.permanent! :host => Travis.config["domain"]

    Rails.logger.flush if Rails.logger.respond_to?(:flush)

  elsif req.host =~ /([-\w]+\.)+#{Regexp.escape(Travis.config["domain"])}/
    # we don't want to use www for now
    req.permanent! :host => Travis.config["domain"]

  else
    # passthrough with no change
  end

end
