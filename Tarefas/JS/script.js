const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list"); 
const editForm = document.querySelector("#edit-form");
const editInput = document.querySelector("#edit-input");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");


const searchInput = document.querySelector("#seacrh-input"); // ID: seacrh-input (corrigido do typo no HTML original)
const eraseButton = document.querySelector("#erase-button");
const filterSelect = document.querySelector("#filter-select");

let oldInputValue;

// --- Persistence helpers (per-user, falls back to guest) ---
const getCurrentUser = () => {
    const u = localStorage.getItem("currentUser");
    const user = (u && u !== 'null') ? u : 'guest';
    console.debug('[TODO] currentUser ->', user);
    return user;
};
const todosKeyForUser = (user) => `todos_${user}`;

const persistTodos = () => {
    const user = getCurrentUser();
    if (!user) return;
    if (!todoList) return;

    const todos = [];
    document.querySelectorAll("#todo-list .todo").forEach(todo => {
        const titleEl = todo.querySelector("h3");
        const text = titleEl ? titleEl.innerText : "";
        const done = todo.classList.contains("done");
        todos.push({ text, done });
    });

    try {
        localStorage.setItem(todosKeyForUser(user), JSON.stringify(todos));
        console.debug('[TODO] persisted', todosKeyForUser(user), todos);
    } catch (err) {
        console.error('[TODO] persist error', err);
    }
};

const loadTodosForUser = () => {
    const user = getCurrentUser();
    if (!user) return;
    if (!todoList) return;

    try {
        const raw = localStorage.getItem(todosKeyForUser(user));
        console.debug('[TODO] loading key', todosKeyForUser(user), raw);
        // clear only the todo-list container before injecting saved ones
        if (todoList) todoList.innerHTML = '';
        const saved = JSON.parse(raw || "[]");
        saved.forEach(t => {
            // add without triggering another persist
            saveTodo(t.text, { done: !!t.done, persist: false });
        });
        console.debug('[TODO] loaded items', saved.length);
    } catch (err) {
        console.error('[TODO] load error', err);
    }
};

const toggleForms = () => {
    
    todoForm.classList.toggle("hide");
    editForm.classList.toggle("hide");

    
    const toolbar = document.querySelector('#toolbar');
    
    
    document.querySelectorAll(".todo").forEach(todo => todo.classList.toggle("hide"));
    if (toolbar) toolbar.classList.toggle("hide");
};

/**
 * Atualiza o texto da tarefa que está sendo editada.
 * @param {string} text 
 */
const updateTodo = (text) => {
    const todos = document.querySelectorAll(".todo");

    todos.forEach((todo) => {
        let todoTitle = todo.querySelector("h3");

        // Encontra a tarefa com o título que corresponde ao valor salvo antes da edição
            if (todoTitle && todoTitle.innerText === oldInputValue) {
            todoTitle.innerText = text;
                // persist after editing a todo
                persistTodos();
            }
    });
};

const filterTodos = () => {
    const filterValue = filterSelect.value;
    const todos = document.querySelectorAll(".todo");

    todos.forEach((todo) => {
      
        todo.style.display = "flex"; 
        
        const isDone = todo.classList.contains("done");

        switch (filterValue) {
            case "all":
                
                break;
            case "done":
             
                if (!isDone) {
                    todo.style.display = "none";
                }
                break;
            case "todo":
                
                if (isDone) {
                    todo.style.display = "none";
                }
                break;
        }
    });
    
   
};
/**
 * @param {boolean} callFilter
 */
const searchTodos = (callFilter = true) => {
    const searchTerm = searchInput.value.toLowerCase();
    const todos = document.querySelectorAll(".todo");
    
    if (searchTerm === "") {
        if (callFilter) {
             filterTodos();
        }
        return;
    }
    todos.forEach((todo) => {
        const todoTitle = todo.querySelector("h3").innerText.toLowerCase();
        
        if (!todoTitle.includes(searchTerm)) {
            todo.style.display = "none";
        } else {
    
            const filterValue = filterSelect.value;
            const isDone = todo.classList.contains("done");
            
            if (filterValue === "all" || 
                (filterValue === "done" && isDone) || 
                (filterValue === "todo" && !isDone)) {
                
                todo.style.display = "flex";
            } else {
                todo.style.display = "none";
            }
        }
    });
};
/**
 * Create a todo element and append to the list.
 * @param {string} text
 * @param {{done?: boolean, persist?: boolean}} [options]
 */
const saveTodo = (text, options = {}) => {
    const { done = false, persist = true } = options;

    const todo = document.createElement("div");
    todo.classList.add("todo");

    const todoTitle = document.createElement("h3");
    todoTitle.innerText = text;
    todo.appendChild(todoTitle);

    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("actions");

    const doneBtn = document.createElement("button");
    doneBtn.classList.add("toggle-done");
    doneBtn.innerHTML = '<i class="fas fa-check"></i>';
    actionsDiv.appendChild(doneBtn);

    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-btn");
    editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
    actionsDiv.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    actionsDiv.appendChild(deleteBtn);

    todo.appendChild(actionsDiv);

    if (done) todo.classList.add('done');

    if (todoList) todoList.appendChild(todo);

    if (todoInput) {
        todoInput.value = "";
        todoInput.focus();
    }

    filterTodos();
    if (persist) persistTodos();
};
if (todoForm) {
    todoForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const inputValue = todoInput.value.trim();

        if (inputValue) {
            saveTodo(inputValue);
        }
    });
}
document.addEventListener("click", (e) => {
    const targetEl = e.target;
    const parentEl = targetEl.closest(".todo"); 
    let todoTitle;

    if (parentEl && parentEl.querySelector("h3")) {
        todoTitle = parentEl.querySelector("h3").innerText || "";
    }
    
 
    if (targetEl.classList.contains("toggle-done") || targetEl.closest(".toggle-done")) {
        if (parentEl) {
            parentEl.classList.toggle("done");
            filterTodos(); // Reaplica o filtro após a mudança de status
            // persist the change
            persistTodos();
        }
        return;
    }
    

    if (targetEl.classList.contains("delete-btn") || targetEl.closest(".delete-btn")) {
        if (parentEl) {
            parentEl.remove();
            // persist after deleting a todo
            persistTodos();
        }
        return;
    }
    
   
    if (targetEl.classList.contains("edit-btn") || targetEl.closest(".edit-btn")) {
        toggleForms(); 

        editInput.value = todoTitle;
        oldInputValue = todoTitle; 
        return;
    }
});


if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", (e) => {
        e.preventDefault();
        toggleForms(); 
    });
}


if (editForm) {
    editForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const editInputValue = editInput.value.trim();

        if (editInputValue) {
            updateTodo(editInputValue);
        }
        
        toggleForms(); 
    });
}


if (searchInput) {
    searchInput.addEventListener("input", () => {
        searchTodos();
    });
}

if (eraseButton) {
    eraseButton.addEventListener("click", (e) => {
        e.preventDefault();
        if (searchInput) searchInput.value = "";
        searchTodos(); 
    });
}

if (filterSelect) {
    filterSelect.addEventListener("change", () => {
        filterTodos();
    });
}


function login(event) {
    event.preventDefault(); 

    const userIn = document.getElementById("username").value.trim();
    const passIn = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error-msg");

    const usersList = JSON.parse(localStorage.getItem("users_list")) || [];
    const validUser = usersList.find(u => u.username === userIn && u.password === passIn);

    if (validUser || (userIn === "admin" && passIn === "123")) {
        localStorage.setItem("authenticated", "true");
        localStorage.setItem("currentUser", userIn);
        
        // Redireciona na mesma aba
        window.location.href = "index.html"; 
    } else {
        if (errorMsg) {
            errorMsg.style.display = "block";
        } else {
            alert("Utilizador ou senha incorretos!");
        }
    }
}

// Liga o formulário à função ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }
    // load saved todos when the tasks page loads
    try { if (typeof loadTodosForUser === 'function') loadTodosForUser(); } catch (err) { console.error('[TODO] load on ready error', err); }
});

// Logout button behavior: clear auth and redirect to login
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    const isAuth = localStorage.getItem("authenticated") === "true";
    if (!isAuth) {
        logoutBtn.style.display = "none";
    }
    logoutBtn.addEventListener('click', e => {
        e.preventDefault();
        // ensure todos are saved for current user before logging out
        try { persistTodos(); } catch (err) { /* ignore */ }
        localStorage.removeItem('authenticated');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
    

// Save todos when user closes or reloads the page
window.addEventListener('beforeunload', () => {
    try { persistTodos(); } catch (err) { /* ignore */ }
});
}

// Registration handling: save new users to localStorage
const registerForm = document.getElementById("register-form");
if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = (document.getElementById("reg-name") || {}).value || "";
        const username = (document.getElementById("reg-username") || {}).value || "";
        const password = (document.getElementById("reg-password") || {}).value || "";

        const trimmedName = name.trim();
        const trimmedUsername = username.trim();

        if (!trimmedName || !trimmedUsername || password.length < 6) {
            alert("Preencha todos os campos corretamente (senha mínimo 6 caracteres).");
            return;
        }

        const usersList = JSON.parse(localStorage.getItem("users_list")) || [];
        const exists = usersList.some(u => u.username === trimmedUsername);
        if (exists) {
            alert("Utilizador já existe. Escolha outro nome de utilizador.");
            return;
        }

        usersList.push({ name: trimmedName, username: trimmedUsername, password });
        localStorage.setItem("users_list", JSON.stringify(usersList));

        // Redirect to login after successful registration
        window.location.href = "login.html";
    });
}

// Cancel button on registration page -> go back to login
const cancelRegisterBtn = document.getElementById("cancel-register-btn");
if (cancelRegisterBtn) {
    cancelRegisterBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "login.html";
    });
}

