// Mengambil referensi elemen-elemen HTML
const taskInput = document.getElementById('task-input');
const deadlineInput = document.getElementById('deadline-input');
const priorityInput = document.getElementById('priority-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');

const categoryInput = document.getElementById('category-input');
const addCategoryBtn = document.getElementById('add-category-btn');
const categoryList = document.getElementById('category-list');
const filterButtons = document.getElementById('filter-buttons');

// Array untuk menyimpan data
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || ['Pribadi', 'Pekerjaan', 'Belajar'];

let countdownInterval;
let currentCategoryFilter = 'all';

// Fungsi untuk menyimpan data ke localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Fungsi untuk meng-handle penambahan kategori
addCategoryBtn.addEventListener('click', () => {
    const newCategory = categoryInput.value.trim();
    if (newCategory && !categories.includes(newCategory)) {
        categories.push(newCategory);
        saveCategories();
        renderCategories();
        categoryInput.value = '';
    }
});

// Fungsi untuk merender daftar kategori dan tombol filter
function renderCategories() {
    categoryList.innerHTML = '';
    filterButtons.innerHTML = '';

    categories.forEach(cat => {
        const li = document.createElement('li');
        li.textContent = cat;
        categoryList.appendChild(li);
    });

    const allBtn = document.createElement('button');
    allBtn.textContent = 'Semua';
    allBtn.className = currentCategoryFilter === 'all' ? 'active' : '';
    allBtn.addEventListener('click', () => filterTasks('all'));
    filterButtons.appendChild(allBtn);

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat;
        btn.className = currentCategoryFilter === cat ? 'active' : '';
        btn.addEventListener('click', () => filterTasks(cat));
        filterButtons.appendChild(btn);
    });
}

// Fungsi untuk memfilter tugas
function filterTasks(category) {
    currentCategoryFilter = category;
    renderTasks();
    renderCategories();
}

// Fungsi untuk menghitung dan memperbarui waktu mundur
function updateCountdown() {
    const now = new Date().getTime();
    const taskItems = taskList.querySelectorAll('.task-item');

    taskItems.forEach((li, index) => {
        const originalIndex = li.dataset.originalIndex;
        const task = tasks[originalIndex];

        if (!task || !task.deadline) return;

        const deadlineDate = new Date(task.deadline).getTime();
        const timeLeft = deadlineDate - now;
        
        const countdownSpan = li.querySelector('.countdown');
        if (!countdownSpan) return;

        if (timeLeft > 0) {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            countdownSpan.textContent = `Sisa waktu: ${days} hari ${hours} j ${minutes} m ${seconds} d`;
            countdownSpan.style.color = '#34495e';
        } else {
            countdownSpan.textContent = 'Waktu habis!';
            countdownSpan.style.color = '#e74c3c';
        }
    });
}

// Fungsi untuk merender (menampilkan) tugas ke halaman web
function renderTasks(newlyAdded = false) {
    taskList.innerHTML = '';
    clearInterval(countdownInterval);

    const tasksToRender = currentCategoryFilter === 'all' ? tasks : tasks.filter(task => task.category === currentCategoryFilter);

    tasksToRender.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        
        if (task.completed) {
            li.classList.add('completed');
        }
        
        const taskContent = `
            <div>
                <span class="task-text">${task.text}</span>
                <span class="task-info">
                    <span class="countdown"></span>
                    <br> Prioritas: ${task.priority} | Kategori: ${task.category}
                </span>
            </div>
            <div class="task-actions">
                <button class="complete-btn" data-action="toggle">${task.completed ? 'Batal' : 'Selesai'}</button>
                <button class="edit-btn" data-action="edit">Edit</button>
                <button class="delete-btn" data-action="delete">Hapus</button>
            </div>
        `;
        
        li.innerHTML = taskContent;
        li.dataset.originalIndex = tasks.indexOf(task); // Simpan indeks aslinya
        taskList.appendChild(li);

        // Tambahkan animasi glow di sini, hanya jika tugas baru
        if (newlyAdded && index === tasksToRender.length - 1) {
            li.classList.add('glow-animation');
            setTimeout(() => {
                li.classList.remove('glow-animation');
            }, 1000);
        }
    });

    countdownInterval = setInterval(updateCountdown, 1000);
}

// Fungsi untuk menghapus tugas
function deleteTask(originalIndex) {
    tasks.splice(originalIndex, 1);
    saveTasks();
    renderTasks();
}

// Fungsi untuk mengedit tugas
function editTask(originalIndex) {
    const newText = prompt('Edit tugas:', tasks[originalIndex].text);
    if (newText !== null && newText.trim() !== '') {
        tasks[originalIndex].text = newText.trim();
        saveTasks();
        renderTasks();
    }
}

// Fungsi untuk menandai tugas sebagai selesai atau belum
function toggleComplete(originalIndex) {
    tasks[originalIndex].completed = !tasks[originalIndex].completed;
    saveTasks();
    renderTasks();
}

// Event listener untuk tombol "Tambah Tugas"
addBtn.addEventListener('click', () => {
    handleAddTask();
});


// Fungsi utama untuk menambahkan tugas
function handleAddTask() {
    const taskText = taskInput.value;
    const deadline = deadlineInput.value;
    const priority = priorityInput.value;
    const category = categoryInput.value;

    if (taskText.trim() === '') {
        alert('Tugas tidak boleh kosong!');
        return;
    }

    const newTask = {
        text: taskText,
        deadline: deadline,
        priority: priority,
        completed: false,
        category: category || 'Uncategorized',
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks(true); // Pastikan baris ini ada
    
    taskInput.value = '';
    deadlineInput.value = '';
    priorityInput.value = 'high';
    categoryInput.value = '';
};



 

 

// Event Delegation: Mendengarkan klik pada container utama
taskList.addEventListener('click', (event) => {
    const target = event.target;
    const taskItem = target.closest('.task-item');

    if (!taskItem) return;

    const originalIndex = parseInt(taskItem.dataset.originalIndex);
    const action = target.dataset.action;
    
    if (action === 'toggle') {
        toggleComplete(originalIndex);
    } else if (action === 'delete') {
        deleteTask(originalIndex);
    } else if (action === 'edit') {
        editTask(originalIndex);
    }
});

// Panggil fungsi render saat halaman pertama kali dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    renderCategories();
});






