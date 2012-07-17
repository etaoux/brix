module Jekyll

  class DemoTag < Liquid::Tag

    def initialize(tag_name, text, tokens)
      super
      @text = text
    end

    def render(context)
      path = @text.strip
      unless path =~ /\.html$/
        path = "#{path}/#{path.split('/').last}.html"
      end 
      "<iframe src='/brix/demo/#{path}' frameborder='0' scrolling='0' class='j-demo'></iframe>"
    end
  end
end

Liquid::Template.register_tag('demo', Jekyll::DemoTag)