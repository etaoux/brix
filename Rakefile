# encoding: utf-8
require 'rubygems'
require 'bundler/setup'

public_dir = '_site'
deploy_dir = '_deploy'

desc "打包、压缩资源文件"
task :lessc do
  system "ceaseless assets/css"
end

desc "生成网站"
task :build do
  system "jekyll"
end

desc "发布到 Github"
task :deploy => ["build"] do
  puts "## 发布当前分支到 Github Pages "
  (Dir["#{deploy_dir}/*"]).each { |f| rm_rf(f) }
  puts "\n## copying #{public_dir} to #{deploy_dir}"
  cp_r "#{public_dir}/.", deploy_dir
  touch "#{deploy_dir}/.nojekyll"
  cd "#{deploy_dir}" do
    system "git add ."
    system "git add -u"
    puts "\n## Commiting: Site updated at #{Time.now.utc}"
    message = "Site updated at #{Time.now.utc}"
    system "git commit -m \"#{message}\""
    puts "\n## Pushing generated website"
    system "git push origin gh-pages --force"
    puts "\n## Github Pages deploy complete"
  end
end