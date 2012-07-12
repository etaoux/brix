# ETaoUX &hearts; Open Source

## 平台化

本站致力于一淘 UX 平台化建设相关的说明文档、技术讨论等。

## 如何编辑本站

Github Pages 提供的特性，如果你的用户名为 etaoux，并且在 etaoux 账号下有个叫做 `etaoux.github.com`
的仓库，则访问 <http://etaoux.github.com> 时，将会打开该仓库中 `master` 分支的内容。

同时，Github Pages 还提供了 jekyll 作为模板化搭建小站的工具。

这也是本站所采用的技术。

### 搭建 jekyll 环境

首先，安装 ruby。Mac 用户有两个选择：

 - 使用系统自带的 ruby，直接安装 jekyll，这里需要加上 sudo `sudo gem install jekyll`；
 - 通过 HomeBrew 安装：`brew install ruby`

Windows 用户，请到 <http://rubyinstaller.org/> 下载安装最新版本

Linux 用户，使用系统所用的包管理工具安装即可：

 - Arch Linux：`sudo pacman -S ruby`
 - Ubuntu: `sudo apt-get install ruby`

有了 ruby 环境之后，再安装 jekyll，`gem install jekyll`

然后，cd 到项目目录，执行 `jekyll --server` 即可，浏览 <http://127.0.0.1:4000> 查看效果

### jekyll 的目录结构

文章都在 `_posts` 目录下

样式与脚本分别在 `assets/css` 与 `assets/js`

