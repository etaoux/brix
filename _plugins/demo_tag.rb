module Jekyll

  class DemoTag < Liquid::Tag

    def initialize(tag_name, text, tokens)
      super
      @text = text
    end

    def render(context)
      path = @text.strip
      name = path.split('/').last
      "<iframe src='/brix/demo/#{path}/#{name}.html' frameborder='0' scrolling='0' class='j-demo'></iframe>"
    end
  end
end

Liquid::Template.register_tag('demo', Jekyll::DemoTag)