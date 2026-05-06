# 项目模板

## 作业要求

制作一个能够**记录课程表**的网站，具体需求如下：

| 功能 | 说明 |
|------|------|
| 添加科目 | 通过表单输入科目名称、老师、教室，选择时间后添加到课程表中 |
| 删除科目 | 每个课程卡片上有 × 按钮，点击即可删除该课程 |
| 拖拽科目 | 使用 HTML5 拖拽 API，将课程卡片拖动到其他时间段 |
| 查询科目时间 | 输入科目名称，查询该科目安排在哪些时间段 |
| 查询教室行程 | 选择星期几，查询当天所有教室的课程安排 |
| 数据持久化 | 使用 LocalStorage 保存课程数据，刷新页面后数据不丢失 |

### 技术要求

| 要求 | 说明 |
|------|------|
| HTML 与 CSS 分离 | 样式统一写在 `src/style.css`，不允许在 HTML 内使用 `<style>` 标签或内联 style |
| JavaScript | 写在独立的 `src/app.js` 文件中，通过 `<script src="app.js">` 引入，不要写在 HTML 内 |
| 拖拽功能 | 使用原生 HTML5 Drag and Drop API 实现 |
| 数据存储 | 使用 `localStorage` 进行数据持久化 |

---

## 目录结构

```
项目根目录/
├── metadata.json        ← 【必填】填写你的姓名、学号、作业名称
├── package.json         ← 依赖配置，无需修改
├── ReadME.md            ← 本文件
├── Report.md            ← 作业报告（需填写）
├── src/                 ← 你的作业代码都写在这里
│   ├── index.html       ← 主页面（已有注释引导）
│   ├── style.css        ← 样式文件（已有注释引导）
│   ├── app.js           ← JavaScript 逻辑文件（已有注释引导）
│   └── assets/          ← 图片资源目录（如需要）
└── tool/
    ├── check.js         ← 自检脚本
    └── pack.js          ← 打包脚本
```

---

## 开始之前

### 1. 安装依赖

打包脚本依赖 `archiver` 库，在开始之前请执行：

```bash
npm install
```

### 2. 填写个人信息

打开根目录的 `metadata.json`，填写你的信息：

```json
{
  "studentName": "张三",
  "studentId": "20240001",
  "assignmentName": "第二次作业-课程表网站"
}
```

### 3. 完成报告

请在 `Report.md` 中撰写你的作业报告，内容包括但不限于：
- 页面结构说明
- 功能实现思路（添加、删除、拖拽、查询、持久化）
- 遇到的问题与解决方案

---

## 开发流程

1. 在 `src/index.html` 中编写页面结构（HTML）
2. 在 `src/style.css` 中编写样式（CSS）
3. 在 `src/app.js` 中编写交互逻辑（JavaScript）
3. 如有图片资源放入 `src/assets/` 目录
4. 完成后运行**自检脚本**，确认没有遗漏：

```bash
node tool/check.js
```

5. 自检全部通过后，运行**打包脚本**生成提交文件：

```bash
node tool/pack.js
```

打包完成后，会在根目录生成：

```
{学号}_{姓名}_{作业名称}.zip
```

将此 zip 文件提交到作业平台即可。

---

## 功能实现提示

### 添加科目

- 使用 `<form>` 收集科目名称、老师、教室、星期、节次
- 提交时调用 `event.preventDefault()` 阻止默认行为
- 创建课程对象，加入数组，保存到 `localStorage`，渲染卡片到对应单元格

### 删除科目

- 在课程卡片上添加一个 × 按钮
- 点击按钮时从数组中删除该课程，更新 `localStorage`，从 DOM 移除卡片

### 拖拽科目

- 课程卡片设置 `draggable="true"`
- `dragstart`：使用 `event.dataTransfer.setData()` 保存课程 ID
- `dragover`：调用 `event.preventDefault()` 允许放置
- `drop`：读取课程 ID，将卡片移动到新单元格，更新课程的时间信息并保存到 `localStorage`

### 查询功能

- **按科目查时间**：遍历课程数组，筛选出名称匹配的课程，展示其时间信息
- **按日期查教室**：遍历课程数组，筛选出星期匹配的课程，按教室分组展示

### 数据持久化

- 使用 `localStorage.setItem('courses', JSON.stringify(courses))` 保存数据
- 页面加载时使用 `JSON.parse(localStorage.getItem('courses'))` 恢复数据并渲染

---

## 注意事项

- **不要**修改 `tool/` 目录下的脚本
- **不要**在 `src/index.html` 中写内联样式，样式统一放 `style.css`
- 图片文件若过大，打包后体积可能超过 8 MB 限制，请提前压缩图片
- 提交前请确保 `metadata.json` 中的姓名和学号已正确填写




