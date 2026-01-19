// DOM元素获取
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const prioritySelect = document.getElementById('prioritySelect');


// 任务列表数组
let tasks = [];

// 从本地存储加载任务
function loadTasks() {
    const storedTasks = localStorage.getItem('todos');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        renderTasks();
        updateStats();
    }
}

// 保存任务到本地存储
function saveTasks() {
    localStorage.setItem('todos', JSON.stringify(tasks));
}

// 添加任务
function addTask() {
    const taskText = taskInput.value.trim();
    const priority = prioritySelect.value;
    
    if (taskText === '') {
        alert('请输入任务内容');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        priority: priority
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    updateStats();
    
    // 清空输入框
    taskInput.value = '';
    prioritySelect.value = 'medium'; // 重置优先级选择
}

// 渲染任务列表
function renderTasks() {
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.priority}-priority`;
        li.dataset.id = task.id;
        
        if (task.completed) {
            li.classList.add('completed');
        }
        
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id));
        
        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        if (task.completed) {
            textSpan.classList.add('completed');
        }
        textSpan.textContent = task.text;
        
        taskContent.appendChild(checkbox);
        taskContent.appendChild(textSpan);
        
        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = '✏️ 编辑';
        editBtn.addEventListener('click', () => editTask(task.id));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        taskActions.appendChild(editBtn);
        taskActions.appendChild(deleteBtn);
        
        li.appendChild(taskContent);
        li.appendChild(taskActions);
        
        taskList.appendChild(li);
    });
    
    // 添加空列表提示
    if (tasks.length === 0) {
        const emptyMsg = document.createElement('li');
        emptyMsg.className = 'empty-message';
        emptyMsg.textContent = '暂无任务，添加一个新任务吧！';
        taskList.appendChild(emptyMsg);
    }
}

// 切换任务完成状态
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// 编辑任务函数
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const taskItem = document.querySelector(`[data-id="${id}"]`);
        const taskContent = taskItem.querySelector('.task-content');
        
        // 创建编辑容器
        const editContainer = document.createElement('div');
        editContainer.className = 'edit-container';
        editContainer.style.display = 'flex';
        editContainer.style.gap = '10px';
        editContainer.style.flex = '1';
        
        // 创建文本输入框
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'task-text-edit';
        editInput.value = task.text;
        editInput.style.flex = '1';
        
        // 创建优先级选择器
        const priorityEdit = document.createElement('select');
        priorityEdit.className = 'priority-edit';
        priorityEdit.value = task.priority;
        priorityEdit.style.padding = '8px';
        priorityEdit.style.borderRadius = '5px';
        priorityEdit.style.border = '2px solid #3498db';
        priorityEdit.style.fontSize = '14px';
        
        // 添加优先级选项
        const priorities = [
            { value: 'high', text: '高优先级' },
            { value: 'medium', text: '中优先级' },
            { value: 'low', text: '低优先级' }
        ];
        
        priorities.forEach(priority => {
            const option = document.createElement('option');
            option.value = priority.value;
            option.textContent = priority.text;
            priorityEdit.appendChild(option);
        });
        
        // 将输入框和选择器添加到容器
        editContainer.appendChild(editInput);
        editContainer.appendChild(priorityEdit);
        
        // 保存原有的内容节点
        const originalContent = taskContent.cloneNode(true);
        
        // 清空原内容并添加编辑容器
        taskContent.innerHTML = '';
        taskContent.appendChild(editContainer);
        
        // 聚焦到输入框
        editInput.focus();
        
        // 保存编辑
        function saveEdit() {
            const newText = editInput.value.trim();
            const newPriority = priorityEdit.value;
            
            if (newText) {
                task.text = newText;
                task.priority = newPriority;
                saveTasks();
                renderTasks();
            } else {
                // 如果输入为空，删除任务
                deleteTask(id);
            }
        }
        
        // 取消编辑
        function cancelEdit() {
            // 恢复原内容
            taskContent.innerHTML = '';
            taskContent.appendChild(originalContent);
        }
        
        // 监听回车和失焦事件
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });
        
        // 优先级选择器失焦时保存
        priorityEdit.addEventListener('blur', () => {
            // 延迟执行，确保点击保存按钮时能先触发
            setTimeout(() => {
                if (!editContainer.contains(document.activeElement)) {
                    saveEdit();
                }
            }, 100);
        });
    }
}

// 删除任务
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
}

// 更新统计信息
function updateStats() {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.filter(task => !task.completed).length;
    
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
}

// 清空已完成任务
function clearCompletedTasks() {
    if (tasks.filter(task => task.completed).length === 0) {
        alert('没有已完成的任务可以清空');
        return;
    }
    
    if (confirm('确定要清空所有已完成的任务吗？')) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// 清空所有任务
function clearAllTasks() {
    if (tasks.length > 0) {
        if (confirm('确定要清空所有任务吗？此操作不可恢复！')) {
            tasks = [];
            saveTasks();
            renderTasks();
            updateStats();
        }
    } else {
        alert('任务列表已经为空！');
    }
}

// 事件监听器
addTaskBtn.addEventListener('click', addTask);
clearCompletedBtn.addEventListener('click', clearCompletedTasks);
clearAllBtn.addEventListener('click', clearAllTasks);

// 回车键添加任务
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', loadTasks);