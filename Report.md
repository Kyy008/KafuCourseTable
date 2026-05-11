# 第二次作业报告

**姓名：** 客昱阳  
**学号：** 23301037  
**作业名称：** 超级课程表

---

作业使用 **纯HTML、CSS、JavaScript** 实现。并已完成 **所有基础与附加功能**。

效果网页一键访问：[KafuCourseTable](https://kyy008.github.io/KafuCourseTable/)

## 1. 页面结构

页面整体采用了桌面端课程表面板与弹窗表单结合的结构，主体使用语义化标签组织，样式与脚本分别写在 `src/style.css` 和 `src/app.js` 中。

- **header**：页面顶部区域，包含英文副标题 `Kafu Course Table`、主标题“我的课程表”，以及“查询科目时间”“查询当日行程”两个操作按钮。
- **timetable**：课程表主体区域，由周数切换栏、星期日期栏和课程网格组成。课程网格按照“7 天 × 7 个时间段”的方式展示一周课程，并在左侧固定显示节次与时间。
- **add-panel**：添加 / 修改科目的弹窗表单。点击空课程格时用于添加课程，点击已有课程卡片时用于修改课程信息。
- **search-panel**：查询功能区以弹窗形式实现，分为“查询科目时间”和“查询当日行程”两个面板。前者通过课程名检索安排，后者通过周数与星期筛选当天课程。
- **week-picker**：周数选择弹窗，支持单周、双周、全选和手动选择具体周数，用于控制课程在哪些教学周显示。
- **delete-dialog**：删除确认弹窗，点击课程卡片上的删除按钮后出现，避免误删课程。

## 2. 功能实现说明

| 功能 | 实现方式 |
|------|----------|
| 添加科目 | 点击空课程格后记录当前 `day` 和 `period` 到 `activeSlot`，打开课程编辑弹窗。点击“完成”后读取表单内容，生成课程对象并 `push` 到 `courses` 数组中，再调用 `saveCourses()` 和 `renderSchedule()` 保存并重新渲染页面。 |
| 修改科目 | 点击已有课程卡片后，复用课程编辑弹窗并预填课程名称、教室、老师和课程周期。保存时通过 `editingCourseId` 找到原课程对象并更新字段，不会新增重复课程。 |
| 删除科目 | 课程卡片右上角设置删除按钮，点击后先通过 `openDeleteConfirm(courseId)` 打开确认弹窗。确认删除时通过 `findIndex()` 找到课程并使用 `splice()` 从数组中移除，然后保存到 LocalStorage 并重绘课程表。 |
| 拖拽科目 | 每张课程卡片设置 `draggable = true`，通过原生 HTML5 Drag and Drop API 完成拖拽。拖拽开始时保存课程 ID，拖入格子时显示高亮和脉冲动画，释放时更新课程对象的 `day` 与 `period`。 |
| 查询科目时间 | 在“查询科目时间”弹窗中输入关键字后，使用 `courses.filter((course) => course.name.includes(keyword))` 筛选课程，并按星期和节次排序展示课程周期、星期、节次、教室和老师。 |
| 查询教室行程 | 在“查询当日行程”弹窗中选择周数和星期，使用课程的 `day` 与 `weeks` 字段筛选当天课程，并按节次排序展示当日课程、教室、老师和周数信息。 |
| 数据持久化 | 使用 `localStorage` 保存课程数组，存储键为 `kafu_courses`。页面加载时执行 `loadCourses()` 恢复数据，添加、删除、拖拽后执行 `saveCourses()` 同步最新数据。 |

## 3. 数据结构设计

本项目用一个课程数组 `courses` 维护全部课程数据，每一项都是一个课程对象。课程对象不仅保存基础信息，也保存显示所需的周数文本和颜色标识，便于渲染时直接生成课程卡片。

```js
[
  {
    id: "course-1770000000000-a1b2c3",
    name: "高等数学",
    teacher: "张老师",
    room: "A201",
    day: 1,
    period: 1,
    weeks: [1, 2, 3, 4, 5, 6, 7, 8],
    weeksText: "第01、02、03、04、05、06、07、08周",
    color: "card-1"
  }
]
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 课程唯一标识，用于删除、拖拽和定位课程对象 |
| `name` | string | 课程名称，未填写时默认显示“未命名课程” |
| `teacher` | string | 任课老师，用于课程卡片和查询结果展示 |
| `room` | string | 教室地点，用于课程卡片和当日行程展示 |
| `day` | number | 星期几，取值范围为 1-7 |
| `period` | number | 第几节课，取值范围为 1-7 |
| `weeks` | number[] | 课程出现的教学周，用数组保存，方便用 `includes()` 判断当前周是否显示 |
| `weeksText` | string | 周数的格式化文本，例如“第01-16周” |
| `color` | string | 课程卡片颜色类名，如 `card-1` 到 `card-15` |

为了保证读取旧数据或异常数据时页面不报错，项目中还设计了 `normalizeCourse()`、`normalizeWeeks()`、`getCourseWeeks()` 等函数，对课程字段和周数范围进行统一整理。修改课程时也依靠 `id` 精确定位原课程对象，只更新内容字段。

## 4. 拖拽功能实现

拖拽功能基于原生 HTML5 Drag and Drop API，并通过事件委托统一绑定在 `scheduleGrid` 上，避免为每个课程卡片和格子单独注册事件。

- **dragstart**：当拖拽课程卡片开始时，读取卡片的 `data-id` 保存到 `draggingCourseId`，同时调用 `event.dataTransfer.setData("text/plain", draggingCourseId)` 写入拖拽数据，并给卡片添加 `is-dragging` 类，显示正在拖动的视觉状态。
- **dragover**：当课程被拖到某个 `.schedule-slot` 上方时，调用 `event.preventDefault()` 允许放置，并设置 `dropEffect = "move"`。同时清理其他格子的拖拽状态，给当前格子添加 `drag-over` 类，根据课程颜色设置 `data-drop-color`，并显示 `dropPulse` 脉冲提示。
- **drop**：释放课程时从 `dataTransfer` 或 `draggingCourseId` 读取课程 ID，找到对应课程对象后，把目标格子的 `data-day` 和 `data-period` 写回课程对象，调用 `saveCourses()` 持久化，再通过 `renderSchedule()` 重新渲染课程表。
- **dragend / clearDragState**：拖拽结束后统一清理 `drag-over`、`drop-pulse`、`is-dragging` 等临时状态，保证下一次拖拽不会残留视觉效果。

## 5. LocalStorage 使用

项目使用浏览器自带的 LocalStorage 完成课程数据持久化，不依赖后端服务，刷新页面后课程不会丢失。

- 保存时机：添加课程、删除课程、拖拽课程到新时间段后都会调用 `saveCourses()`。
- 恢复时机：页面脚本初始化时执行 `const courses = loadCourses()`，从 LocalStorage 读取已有课程。
- 存储键名：`kafu_courses`。
- 存储格式：使用 `JSON.stringify(courses)` 将课程数组转为字符串保存，读取时使用 `JSON.parse()` 还原为数组。
- 容错处理：`loadCourses()` 使用 `try...catch` 包裹读取逻辑，如果本地数据为空、不是数组或 JSON 解析失败，会返回空数组，避免页面初始化失败。

```js
function saveCourses() {
  localStorage.setItem(courseStorageKey, JSON.stringify(courses));
}
```

## 6. 遇到的问题与解决方案

| 问题 | 解决方案 |
|------|----------|
| 课程需要按不同教学周显示，单纯保存星期和节次无法满足需求 | 为课程对象增加 `weeks` 数组和 `weeksText` 字段。渲染课程格时通过 `course.weeks.includes(currentWeek)` 判断当前周是否展示该课程。 |
| 拖拽到空格子时用户不容易判断能否放置 | 在 `dragover` 中给目标格添加 `drag-over` 类，并用 `dropPulse` 动画和跟随课程颜色的边框提示可放置区域。 |
| 删除按钮直接删除容易误操作 | 增加删除确认弹窗，先把待删除课程 ID 存入 `pendingDeleteCourseId`，用户点击确认后才真正从数组中移除。 |
| 添加和修改课程的表单内容高度相似 | 复用同一个课程编辑弹窗，通过 `editingCourseId` 区分新增和修改模式，减少重复 DOM 和重复逻辑。 |
| 查询结果变化不够明显 | 查询后先清空结果区域，再添加 `is-updated` 类触发 `queryResultsRise` 动画，让结果列表有轻微上浮进入效果。 |
| 小屏幕下课程表宽度过大，容易挤压内容 | 在移动端把课程表放入横向滚动容器，并让左侧时间轴使用 `position: sticky` 固定，保证横向浏览时仍能看到节次。 |

1. **`:hover` / `:focus-visible`**：用于按钮、课程卡片、课程格和日期选择按钮等交互元素。课程卡片悬停时会轻微上浮并显示删除按钮；空课程格悬停时显示添加提示；按钮悬停时提供颜色和位移反馈。
2. **`::after`**（或 `::before` / `:nth-child` 等）：`.schedule-slot::before` 用于生成空课程格的浅色背景提示，`.schedule-slot::after` 用于生成居中的“+”号添加提示；`.link-row strong::after` 用于在“课程周期”行后显示箭头；`.week-mode.is-selected span::after` 用边框绘制选中对勾。

## 7. 附加项（加分）

本项目使用了 CSS 动画、CSS 变形和响应式布局作为附加功能，提升了课程表页面的视觉层次、交互反馈和多设备适配效果。具体应用情况如下：

### 7.1 CSS 动画（@keyframes）

共使用了 13 个自定义动画，详情如下：

| 动画名称 | 使用位置 | 作用 |
|----------|----------|------|
| `calendarSlideLeft` | line258：星期日期栏切换到下一周 | 日期数字从右侧淡入滑动，模拟日历向后翻页效果 |
| `calendarSlideRight` | line270：星期日期栏切换到上一周 | 日期数字从左侧淡入滑动，模拟日历向前翻页效果 |
| `weekLabelSlideLeft` | line282：顶部周数标签切换到下一周 | 周数文字向左切换时产生轻微进入动画 |
| `weekLabelSlideRight` | line294：顶部周数标签切换到上一周 | 周数文字向右切换时产生轻微进入动画 |
| `dropPulse` | line513：课程拖拽目标格子 | 拖拽课程到目标时间格时，显示向内收缩的脉冲边框，提示可以放置 |
| `courseCardsSlideLeft` | line577：课程卡片周切换 | 切换到下一周后，课程卡片从右侧淡入，增强周视图切换反馈 |
| `courseCardsSlideRight` | line589：课程卡片周切换 | 切换到上一周后，课程卡片从左侧淡入，保持动画方向与操作一致 |
| `cardWiggle` | line601：正在拖拽的课程卡片 | 拖拽中让课程卡片轻微旋转和缩放，强调当前被移动的对象 |
| `backdropFadeIn` | line817：普通弹窗遮罩层 | 添加课程、查询等弹窗打开时，遮罩层平滑淡入 |
| `confirmBackdropIn` | line827：删除确认弹窗遮罩层 | 删除确认弹窗打开时，遮罩层快速淡入，突出确认操作 |
| `modalGrowFromCell` | line837：添加课程弹窗 | 弹窗从被点击的课程格位置放大进入，形成从格子展开表单的视觉效果 |
| `confirmPopIn` | line854：删除确认框 | 删除确认框从下方轻微上浮并放大出现，提升警示弹窗的反馈感 |
| `queryResultsRise` | line1154：查询结果列表 | 查询结果刷新后从下方淡入上浮，提示结果区域已经更新 |

### 7.2 CSS Transform 变形

共使用了 29 处 `transform` 属性，其中一些主要应用如下：

| Transform 函数 | 使用位置 | 作用 |
|----------------|----------|------|
| `translateY` | line174：周切换圆形按钮 | 鼠标悬停时按钮轻微上浮，提供可点击反馈 |
| `translateX` | line261-302：日期栏与周数标签动画 | 在 `@keyframes` 中动态改变 X 轴位移，实现上一周 / 下一周的方向感 |
| `translate(-50%, -50%)` | line380：空课程格加号提示 | 配合 `top: 50%` 和 `left: 50%`，让添加提示始终在格子中居中 |
| `scale` | line516、line525：拖拽放置脉冲动画 | 通过缩放边框实现目标格的脉冲提示，强化拖拽放置状态 |
| `translateY` | line554：课程卡片悬停 | 鼠标悬停时卡片向上移动 1px，配合阴影形成上浮效果 |
| `translateX` | line580-597：课程卡片周切换动画 | 课程卡片根据切换方向从左侧或右侧进入，使周视图切换更自然 |
| `rotate` + `translateX` + `scale` | line603-611：拖拽中的课程卡片 | 通过旋转、左右位移和缩小组合，形成拖拽时的轻微晃动反馈 |
| `translate` + `scale` | line840-850：课程编辑弹窗 | 根据点击格子计算起始位移，让弹窗从对应格子缩放展开 |
| `translateY` + `scale` | line857-862：删除确认框 | 弹窗从下方向上出现并恢复到正常大小，提升确认操作的层次感 |
| `translateY` | line1157-1162：查询结果动画 | 查询结果区域从下方进入，突出搜索后的内容变化 |
| `translateY` + `rotate` | line1216：周数选择模式对勾 | 使用边框和旋转绘制选中状态的对勾图形 |

### 7.3 响应式布局

页面针对桌面端、平板宽度和手机端分别设置了响应式规则，保证课程表、弹窗和查询面板在不同屏幕宽度下都能正常使用。

| 断点 / 技术 | 使用位置 | 作用 |
|-------------|----------|------|
| `@media (max-width: 1180px)` | line1242：中等屏幕适配 | 调整页面主体宽度、课程表列宽和弹窗宽度，使页面在较窄桌面窗口中仍保持完整布局 |
| `@media (max-width: 900px)` | line1268：平板与手机横屏适配 | 取消页面固定最小宽度，允许页面纵向滚动，并把头部按钮改为两列网格布局 |
| 横向滚动课程表 | line1316-1338：课程表外层和表格宽度 | 小屏幕下为 `.week-panel` 开启 `overflow-x: auto`，同时给 `.schedule-board` 设置固定宽度，避免课程格被压缩变形 |
| 粘性时间轴 | line1341-1355：月份格与左侧节次列 | 使用 `position: sticky` 固定左侧月份和节次，横向滚动课程表时仍能看清每一行对应的时间 |
| 移动端删除按钮 | line1365：课程卡片删除按钮 | 在无鼠标悬停的设备上让删除按钮保持显示，解决触屏设备无法 hover 的问题 |
| 移动端弹窗宽度 | line1374-1382、line1437-1440：课程编辑、周数选择、确认弹窗 | 弹窗宽度改为接近视口宽度，并限制最大高度，避免表单内容溢出屏幕 |
| `@media (hover: none)` | line1387：触屏设备交互提示 | 在触屏设备上直接显示空课程格的浅色背景和加号提示，弥补没有鼠标悬停的问题 |
| `@media (max-width: 600px)` | line1399：手机窄屏适配 | 缩小标题、按钮、弹窗内边距和查询控件尺寸，让表单在窄屏下仍然清晰可读 |
| 表单单列布局 | line1464-1482：移动端添加课程表单 | 将原本左右两列的表单改为单列排列，输入框左对齐，避免文字和输入内容挤在一起 |
| 周数选择器压缩 | line1489-1512：移动端周数弹窗 | 允许单周、双周、全选按钮换行，并缩小周数按钮高度和字号，提升手机端可操作性 |

## 8. 素材来源

页面图片素材来源：

- 背景图片：Pixiv
- 网站图标：Pixiv
