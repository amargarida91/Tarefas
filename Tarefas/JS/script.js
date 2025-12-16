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

 * @param {string} text 
 */
const saveTodo = (text) => {
 
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
    
  
    todoList.appendChild(todo);

    todoInput.value = "";
    todoInput.focus();
    
    filterTodos(); 
};
todoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputValue = todoInput.value.trim();

    if (inputValue) {
        saveTodo(inputValue);
    }
});
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
        }
        return; 
    }
    

    if (targetEl.classList.contains("delete-btn") || targetEl.closest(".delete-btn")) {
        if (parentEl) {
            parentEl.remove();
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


cancelEditBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleForms(); 
});


editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const editInputValue = editInput.value.trim();

    if (editInputValue) {
        updateTodo(editInputValue);
    }
    
    toggleForms(); 
});


searchInput.addEventListener("input", () => {
    searchTodos();
});

eraseButton.addEventListener("click", (e) => {
    e.preventDefault();
    searchInput.value = "";
  
    searchTodos(); 
});

filterSelect.addEventListener("change", () => {
    filterTodos();
});


document.addEventListener('DOMContentLoaded', filterTodos);