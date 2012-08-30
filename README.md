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

本站使用 bundler 管理 ruby gems，所以，安装好 ruby 之后，先安装 bundler，然后 `bundle install` 即可

```bash
$ gem install bundler
$ bundle install
```

如果遇到权限问题，请在命令前头加上 `sudo`。

然后，cd 到项目目录，执行 `jekyll --server` 即可，浏览 <http://127.0.0.1:4000> 查看效果。

### 编辑方式

jekyll 提供实时更新的功能，启动服务时，加上 auto 参数：

```bash
$ jekyll --server --auto
```

就可以在 <http://127.0.0.1:4000> 实时预览效果了

同时，为方便编辑样式，我们使用了 ceaseless 来实时编译 less 文件，在项目目录中执行：

```bash
$ ceaseless --watch assets/css
```

即可。less 文件将会实时编译，保证本地编辑本站样式的流畅性。

### jekyll 的目录结构

文章都在各自类目的 `_posts` 目录下，比如，Brix Style 的相关文档，都在 `style/_posts` 目录下边。

样式与脚本分别在 `assets/css` 与 `assets/js`
