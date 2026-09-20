# 林翩翩 · 松烟鎏金书斋

[English](./README.md)

面向 DeepSeek Harness Web UI 的独立显示层皮肤。0.2.0 将旧发布版更新为当前的
临水藏书阁昼夜场景、精修双人物、薄绢刺绣输入框和桂枝装裱侧栏，不修改后端、模型或工具行为。

![亮色预览](./preview/light.webp)
![暗色预览](./preview/dark.webp)

## 安装与更新

需要 Node.js `^22.19.0 || >=24.0.0` 和 pnpm。包内包含预构建 JavaScript，
安装不执行 prepare，也不需要重新生图或烘焙。

```sh
npm install --global pnpm
npx @deepseek-ai/dsh plugin --profile web add github:AiNaer/dsh-linpianpian-skin
npx @deepseek-ai/dsh web
```

需要固定版本时，在 GitHub 安装源后加 `#<tag-or-commit-sha>`。
本地安装使用仓库或 tarball 的**绝对路径**。同版本替换必须先 remove 再 add，
然后重启 Harness 并硬刷新浏览器，不能只覆盖压缩包。

```sh
npx @deepseek-ai/dsh plugin --profile web remove dsh-linpianpian-skin
npx @deepseek-ai/dsh plugin --profile web add /absolute/path/to/dsh-linpianpian-skin
```

发布包名为 `dsh-linpianpian-skin`，与开发包
`@dsh-external/dsh-client-ui-skin-linpianpian` 不同，但共用 wiring id。
从开发包迁移时，先将开发包从目标 profile 移除，再安装发布包。
同一时间只启用一套完整皮肤；其他皮肤可保留安装，由兼容的皮肤管理器停用。
若旧宿主仍挂载已禁用皮肤，需要先清除该皮肤在 profile 中的活动注册项再重启，
仅隐藏 body 标记不足以解决双重挂载。

使用 dshmarket 的 profile 可以运行仓库提供的互斥激活工具：

```sh
node scripts/activate-skin.mjs --profile web
```

工具保留状态中的未知字段，拒绝覆盖损坏 JSON，并要求本发布包已安装；它不会自行重启
Harness。卸载使用上面的 remove 命令，重启后恢复原界面。

## 当前效果

- 1672 × 941 临水藏书阁昼夜背景，背景与双人物随聊天区域适配。
- 左侧精修探身人物与右侧捧花人物；活跃对话让位，设置与窄屏按规则隐藏。
- 松烟、鎏金与宣纸暖白配色，亮暗主题保持清楚可读。
- 固定密度刺绣滑轨与独立桂花白玉章，花纹和绢面褶皱不随宽度拉伸。
- 完整桂枝按钮饰框、当前工作区锦带、细金边会话选中态、贴边弧形花边和压暗的 Q 版人物。
- 内容宽度拖拽条悬停即呈现墨绿暖金流动光带，拖动时继续跟随鼠标。
- 输入框空态胶囊与滚动显隐、宽表格展卷、设置导航提示、启动错误页、减少动态效果与性能保护。
- 资源全部内嵌，无运行时外部图片请求、统计代码或凭据读取。

## 个性化与兼容范围

兼容的 skin-manager 提供六项设置：正文宋体、背景开关、宽屏设置居中、人物开关、
素书模式时段和输入框显示方式。旧配置自动采用新增字段的默认值。
**仅安装 dshmarket 1.45.1 不会提供这些配置入口。**

本次同步实现已在 Web profile 的 Harness `0.1.2rc1`、Cordis `4.0.1` 上验收。
兼容字段只记录实际验证版本；宿主预览版升级后仍需重新检查。

## 开发与构建

```sh
pnpm install --frozen-lockfile
pnpm check
```

修改素材母版后：

```sh
python -m pip install -r requirements-dev.txt
python scripts/bake-art.py
pnpm generate:art
pnpm check
```

`check` 依次进行类型检查、构建、测试和包内容预览。构建生成宿主与浏览器 bundle、
浏览器 source map 和 `skin.build.json`。生成资源与构建均不依赖邻接开发仓库、
用户绝对路径或已配置的 Git 远端。不要手改生成文件。

安装包仅包含预构建文件、元数据、预览、许可说明、双语 README 与激活脚本；
原始美术、测试和开发源码留在仓库。详见[架构](./docs/architecture.md)、
[发布检查](./docs/releasing.md)。

## 许可与署名

发布版原创代码继续使用 [PolyForm Noncommercial](./LICENSE)，原创素材沿用
[素材许可](./LICENSE-ASSETS.md)。第三方角色素材和借鉴代码保留各自署名与限制，
不会因本项目许可而获得更宽的授权。角色来源及保留的 MIT 代码声明见 [NOTICE](./NOTICE)。
