/**
 * Autor: bulbashenko (Aleksandr Albekov)
 * Dátum: 27. október 2024
 */

// Získanie referencií na DOM prvky
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const filterButtons = document.querySelectorAll('.filter-btn');

let todos = [];

// Inicializácia Sortable.js na zozname úloh
const sortable = new Sortable(todoList, {
    animation: 150,
    onEnd: function (evt) {
        // Presun položky na nové miesto
        const movedItem = todos.splice(evt.oldIndex, 1)[0];
        todos.splice(evt.newIndex, 0, movedItem);
        saveAndRender();
    }
});

// Načítanie úloh z localStorage pri načítaní stránky
document.addEventListener('DOMContentLoaded', () => {
    const storedTodos = JSON.parse(localStorage.getItem('todos'));
    if (storedTodos) {
        todos = storedTodos;
        renderTodos();
    }
});

// Pridanie novej úlohy
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text !== '') {
        const newTodo = {
            id: Date.now(),
            text,
            completed: false
        };
        todos.push(newTodo);
        saveAndRender();
        todoInput.value = '';
    }
});

// Uloženie úloh do localStorage a vykreslenie zoznamu
function saveAndRender() {
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos(currentFilter);
}

// Aktuálny vybraný filter
let currentFilter = 'all';

// Vykreslenie úloh podľa aktuálneho filtra
function renderTodos(filter = 'all') {
    currentFilter = filter;
    todoList.innerHTML = '';
    let filteredTodos = [];
    if (filter === 'all') {
        filteredTodos = todos;
    } else if (filter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }

    filteredTodos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.classList.add('todo-item');
        if (todo.completed) {
            li.classList.add('completed');
        }

        // Checkbox na označenie ako dokončené
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleComplete(todo.id));

        // Text úlohy
        const span = document.createElement('span');
        span.classList.add('todo-text');
        span.textContent = todo.text;

        // Tlačidlá na úpravu a odstránenie
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('todo-actions');

        // Tlačidlo na odstránenie
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Odstrániť';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        // Tlačidlo na úpravu
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '&#9998;'; // Ikona ceruzky
        editBtn.title = 'Upraviť';
        editBtn.addEventListener('click', () => editTodo(todo.id));

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(actionsDiv);

        todoList.appendChild(li);
    });
}

// Funkcia na prepínanie stavu dokončenia
function toggleComplete(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveAndRender();
}

// Funkcia na odstránenie úlohy s animáciou
function deleteTodo(id) {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
        // Pridanie triedy na animáciu odstránenia
        const li = todoList.children[todoIndex];
        if (li) {
            li.classList.add('removing');
            // Po dokončení prechodu odstránime úlohu
            li.addEventListener('transitionend', () => {
                todos = todos.filter(todo => todo.id !== id);
                saveAndRender();
            });
        }
    }
}

// Funkcia na úpravu úlohy
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    const newText = prompt('Upravte úlohu:', todo.text);
    if (newText !== null) {
        const trimmedText = newText.trim();
        if (trimmedText !== '') {
            todo.text = trimmedText;
            saveAndRender();
        }
    }
}

// Pridanie funkčnosti filtrovacím tlačidlám
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Odstránenie aktívnej triedy z všetkých tlačidiel
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Pridanie aktívnej triedy na kliknuté tlačidlo
        button.classList.add('active');
        // Vykreslenie úloh podľa vybraného filtra
        const filter = button.getAttribute('data-filter');
        renderTodos(filter);
    });
});
