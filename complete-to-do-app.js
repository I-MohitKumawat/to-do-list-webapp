class TodoApp {
            constructor() {
                this.tasks = [];
                this.filter = 'all';
                this.sortBy = 'date';
                this.editingId = null;
                this.deletedTask = null;
                this.deletedCompletedTasks = null;
                this.draggedElement = null;
                this.useLocalStorage = true; 
                
                this.initializeElements();
                this.attachEventListeners();
                this.loadTasks();
                this.render();
            }

            initializeElements() {
                this.taskInput = document.getElementById('taskInput');
                this.dueDateInput = document.getElementById('dueDateInput');
                this.prioritySelect = document.getElementById('prioritySelect');
                this.addBtn = document.getElementById('addBtn');
                this.taskList = document.getElementById('taskList');
                this.progressFill = document.getElementById('progressFill');
                this.progressText = document.getElementById('progressText');
                this.sortSelect = document.getElementById('sortSelect');
                this.markAllBtn = document.getElementById('markAllBtn');
                this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
                this.undoContainer = document.getElementById('undoContainer');
                this.undoBtn = document.getElementById('undoBtn');
                this.undoMessage = document.getElementById('undoMessage');
                this.celebrationMessage = document.getElementById('celebrationMessage');
            }

            attachEventListeners() {
                this.addBtn.addEventListener('click', () => this.addTask());
                this.taskInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addTask();
                });

                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
                });

                this.sortSelect.addEventListener('change', (e) => {
                    this.sortBy = e.target.value;
                    this.render();
                });

                this.markAllBtn.addEventListener('click', () => this.markAllComplete());
                this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
                this.undoBtn.addEventListener('click', () => this.undoDelete());
            }

            loadTasks() {
                if (this.useLocalStorage) {
                    try {
                        const saved = localStorage.getItem('todoTasks');
                        if (saved) {
                            this.tasks = JSON.parse(saved);
                        }
                    } catch (error) {
                        console.error('Error loading tasks from localStorage:', error);
                        this.tasks = [];
                    }
                } else {
                    
                    this.tasks = [];
                }
            }

            saveTasks() {
                if (this.useLocalStorage) {
                    try {
                        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
                    } catch (error) {
                        console.error('Error saving tasks to localStorage:', error);
                    }
                }
               
            }

            addTask() {
                const text = this.taskInput.value.trim();
                if (!text) return;

                const task = {
                    id: Date.now(),
                    text: text,
                    completed: false,
                    priority: this.prioritySelect.value,
                    dueDate: this.dueDateInput.value || null,
                    createdAt: new Date().toISOString()
                };

                this.tasks.unshift(task);
                this.taskInput.value = '';
                this.dueDateInput.value = '';
                this.prioritySelect.value = 'medium';
                
                this.saveTasks();
                this.render();
            }

            toggleTask(id) {
                const task = this.tasks.find(t => t.id === id);
                if (task) {
                    const wasCompleted = task.completed;
                    task.completed = !task.completed;
                    this.saveTasks();
                    this.render();
                    
                    // Check if all tasks are now completed and show celebration
                    if (!wasCompleted && this.areAllTasksCompleted()) {
                        this.showCelebration();
                    }
                }
            }

            editTask(id, newText) {
                const task = this.tasks.find(t => t.id === id);
                if (task) {
                    task.text = newText.trim();
                    this.saveTasks();
                    this.render();
                }
            }

            deleteTask(id) {
                const taskIndex = this.tasks.findIndex(t => t.id === id);
                if (taskIndex > -1) {
                    this.deletedTask = { task: this.tasks[taskIndex], index: taskIndex, type: 'single' };
                    this.deletedCompletedTasks = null; // Clear any pending bulk undo
                    this.tasks.splice(taskIndex, 1);
                    this.saveTasks();
                    this.render();
                    this.showUndo('Task deleted');
                }
            }

            clearCompleted() {
                const completedTasks = this.tasks.filter(task => task.completed);
                if (completedTasks.length === 0) return;
                
                this.deletedCompletedTasks = {
                    tasks: completedTasks,
                    type: 'bulk'
                };
                this.deletedTask = null; // Clear any pending single undo
                this.tasks = this.tasks.filter(task => !task.completed);
                this.saveTasks();
                this.render();
                this.showUndo(`${completedTasks.length} completed tasks cleared`);
            }

            undoDelete() {
                if (this.deletedTask && this.deletedTask.type === 'single') {
                    this.tasks.splice(this.deletedTask.index, 0, this.deletedTask.task);
                    this.deletedTask = null;
                } else if (this.deletedCompletedTasks && this.deletedCompletedTasks.type === 'bulk') {
                    this.tasks = [...this.tasks, ...this.deletedCompletedTasks.tasks];
                    this.deletedCompletedTasks = null;
                }
                
                this.hideUndo();
                this.saveTasks();
                this.render();
            }

            showUndo(message = 'Task deleted') {
                this.undoMessage.textContent = message;
                this.undoContainer.style.display = 'flex';
                
                clearTimeout(this.undoTimeout);
                this.undoTimeout = setTimeout(() => {
                    this.hideUndo();
                }, 5000);
            }

            hideUndo() {
                this.undoContainer.style.display = 'none';
                clearTimeout(this.undoTimeout);
            }

            areAllTasksCompleted() {
                return this.tasks.length > 0 && this.tasks.every(task => task.completed);
            }

            showCelebration() {
                this.createConfetti();
                this.celebrationMessage.style.display = 'block';
                
                setTimeout(() => {
                    this.celebrationMessage.style.display = 'none';
                }, 4000);
            }

            createConfetti() {
                const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
                const confettiCount = 50;
                
                for (let i = 0; i < confettiCount; i++) {
                    setTimeout(() => {
                        const confetti = document.createElement('div');
                        confetti.className = 'confetti';
                        confetti.style.left = Math.random() * 100 + 'vw';
                        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                        confetti.style.animationDelay = Math.random() * 2 + 's';
                        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                        
                        document.body.appendChild(confetti);
                        
                        setTimeout(() => {
                            confetti.remove();
                        }, 4000);
                    }, i * 50);
                }
            }

            setFilter(filter) {
                this.filter = filter;
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.filter === filter);
                });
                this.render();
            }

            markAllComplete() {
                const hadIncompleteTasks = this.tasks.some(task => !task.completed);
                this.tasks.forEach(task => task.completed = true);
                this.saveTasks();
                this.render();
                
                if (hadIncompleteTasks && this.tasks.length > 0) {
                    this.showCelebration();
                }
            }

            clearCompleted() {
                const completedTasks = this.tasks.filter(task => task.completed);
                if (completedTasks.length === 0) return;
                
                this.deletedCompletedTasks = {
                    tasks: completedTasks,
                    type: 'bulk'
                };
                this.deletedTask = null; // Clear any pending single undo
                this.tasks = this.tasks.filter(task => !task.completed);
                this.saveTasks();
                this.render();
                this.showUndo(`${completedTasks.length} completed tasks cleared`);
            }

            getFilteredTasks() {
                let filtered = [...this.tasks];

                switch (this.filter) {
                    case 'active':
                        filtered = filtered.filter(task => !task.completed);
                        break;
                    case 'completed':
                        filtered = filtered.filter(task => task.completed);
                        break;
                }

                return this.sortTasks(filtered);
            }

            sortTasks(tasks) {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                
                return tasks.sort((a, b) => {
                    switch (this.sortBy) {
                        case 'priority':
                            return priorityOrder[b.priority] - priorityOrder[a.priority];
                        case 'due':
                            if (!a.dueDate && !b.dueDate) return 0;
                            if (!a.dueDate) return 1;
                            if (!b.dueDate) return -1;
                            return new Date(a.dueDate) - new Date(b.dueDate);
                        case 'status':
                            return a.completed - b.completed;
                        default:
                            return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                });
            }

            updateProgress() {
                const total = this.tasks.length;
                const completed = this.tasks.filter(task => task.completed).length;
                const percentage = total === 0 ? 0 : (completed / total) * 100;
                
                this.progressFill.style.width = `${percentage}%`;
                this.progressText.textContent = `${completed} of ${total} tasks completed`;
            }

            handleDragStart(e, id) {
                this.draggedElement = id;
                e.target.classList.add('dragging');
            }

            handleDragEnd(e) {
                e.target.classList.remove('dragging');
                this.draggedElement = null;
            }

            handleDragOver(e) {
                e.preventDefault();
            }

            handleDrop(e, targetId) {
                e.preventDefault();
                if (this.draggedElement && this.draggedElement !== targetId) {
                    const draggedIndex = this.tasks.findIndex(t => t.id === this.draggedElement);
                    const targetIndex = this.tasks.findIndex(t => t.id === targetId);
                    
                    const [draggedTask] = this.tasks.splice(draggedIndex, 1);
                    this.tasks.splice(targetIndex, 0, draggedTask);
                    
                    this.saveTasks();
                    this.render();
                }
            }

            formatDate(dateString) {
                if (!dateString) return '';
                const date = new Date(dateString);
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                if (date.toDateString() === today.toDateString()) {
                    return 'Due today';
                } else if (date.toDateString() === tomorrow.toDateString()) {
                    return 'Due tomorrow';
                } else {
                    return `Due ${date.toLocaleDateString()}`;
                }
            }

            render() {
                const filteredTasks = this.getFilteredTasks();
                
                if (filteredTasks.length === 0) {
                    this.taskList.innerHTML = `
                        <div class="empty-state">
                            <h3>🎯 All caught up!</h3>
                            <p>No tasks to show. Add a new task to get started.</p>
                        </div>
                    `;
                } else {
                    this.taskList.innerHTML = filteredTasks.map(task => `
                        <div class="task-item ${task.completed ? 'completed' : ''}" 
                             draggable="true"
                             ondragstart="app.handleDragStart(event, ${task.id})"
                             ondragend="app.handleDragEnd(event)"
                             ondragover="app.handleDragOver(event)"
                             ondrop="app.handleDrop(event, ${task.id})">
                            <input type="checkbox" class="task-checkbox" 
                                   ${task.completed ? 'checked' : ''} 
                                   onchange="app.toggleTask(${task.id})">
                            
                            <div class="task-content">
                                ${this.editingId === task.id ? `
                                    <input type="text" class="task-input-edit" 
                                           value="${task.text}" 
                                           onblur="app.saveEdit(${task.id}, this.value)"
                                           onkeypress="if(event.key==='Enter') app.saveEdit(${task.id}, this.value)"
                                           autofocus>
                                ` : `
                                    <div class="task-text ${task.completed ? 'completed' : ''}">${task.text}</div>
                                `}
                                
                                <div class="task-meta">
                                    <span class="priority ${task.priority}">${task.priority.toUpperCase()}</span>
                                    ${task.dueDate ? `<span>📅 ${this.formatDate(task.dueDate)}</span>` : ''}
                                    <span>📅 Added ${new Date(task.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div class="task-actions">
                                <button class="action-btn edit-btn" onclick="app.startEdit(${task.id})" title="Edit task">✏️</button>
                                <button class="action-btn delete-btn" onclick="app.deleteTask(${task.id})" title="Delete task">🗑️</button>
                            </div>
                        </div>
                    `).join('');
                }
                
                this.updateProgress();
            }

            startEdit(id) {
                this.editingId = id;
                this.render();
            }

            saveEdit(id, newText) {
                if (newText.trim()) {
                    this.editTask(id, newText);
                }
                this.editingId = null;
                this.render();
            }
        }

        // Initialize the app
        const app = new TodoApp();