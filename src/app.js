/**
 * app.js —— 课程表网站核心逻辑
 *
 * 核心功能清单：
 *   1. 页面加载时从 LocalStorage 读取数据并渲染课程表
 *   2. 添加课程：表单提交 → 创建课程对象 → 存入 LocalStorage → 渲染卡片到对应单元格
 *   3. 删除课程：点击 × → 从 DOM 移除卡片 → 从 LocalStorage 删除
 *   4. 拖拽课程：dragstart 记录课程 ID → dragover 允许放置 → drop 移动卡片到新单元格 → 更新 LocalStorage
 *   5. 查询科目时间：遍历 LocalStorage 中的课程，筛选匹配的科目名称
 *   6. 查询教室行程：遍历 LocalStorage 中的课程，筛选匹配的星期
 */

// TODO: 在这里编写你的 JavaScript 代码
//
// 建议的数据结构（仅供参考，可自行设计）：
// const courses = [
//   { id: 'course_1', name: '高等数学', teacher: '张老师', room: 'A201', day: 1, period: 1 },
//   { id: 'course_2', name: '大学英语', teacher: '李老师', room: 'B302', day: 2, period: 3 },
//   ...
// ];
//
// LocalStorage 操作提示：
//   保存：localStorage.setItem('courses', JSON.stringify(courses));
//   读取：JSON.parse(localStorage.getItem('courses')) || [];
//
// 拖拽 API 提示：
//   dragstart 事件：event.dataTransfer.setData('text/plain', courseId);
//   dragover  事件：event.preventDefault();  // 必须调用，否则无法触发 drop
//   drop      事件：const id = event.dataTransfer.getData('text/plain');
//                    然后将对应卡片移动到当前单元格，并更新数据
