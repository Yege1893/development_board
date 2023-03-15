"use strict"


const tasksModule = {
    tasks: [],

    assignee: {
        email: null,
        firstname: null,
        surname: null,

    },

    createElementID() {
        let id = this.tasks.length
        id += 1
        return String(id)
    },

    edit(id, name, description, status , modiefiedAt/*, priority , assignee , completed_at */, external = 'defaultValue') {
        for (const index in this.tasks) {
            const task = this.tasks[index]
            if (task.id === id) {
                task.name = name
                task.description = description
                task.status = status
                task.modiefiedAt = modiefiedAt
                /* 
                task.priority: priority,
                task.assignee: assignee,
                task.completed_at: completed_at,*/
                task.external = external,
                this.emit("edit", task)
            }
        }
    },

    getElementIdByFormular(name, description, status) {
        for (const element of this.tasks) {
            if (element.name === name && element.description === description && element.status === status) {
                return element.id
            }
        }
    },

    add(id = 'defaultValue' ,name, description, status /*, priority , assignee */, modiefiedAt) {
        const task = {
            id: id,
            name: name,
            description: description,
            status: status,
            modiefiedAt: modiefiedAt
            /* priority: priority,
             responsibility: responsibility,
             assignee: assignee,
             completed_at: completed_at,
             created_at: created_at*/
        }
        this.tasks.push(task)
        this.emit("add", task)
    },
    remove(id) {
        for (const index in this.tasks) {
            const task = this.tasks[index]
            if (task.id === id) {
                this.tasks.splice(index, 1)
                this.emit("remove", task)
            }
        }
    },
    events: {},
    emit(eventName, param) {
        if (eventName in this.events) {
            for (const f of this.events[eventName]) {
                f(param)
            }
        }
    },
    on(eventName, cb) {
        if (!(eventName in this.events)) {
            this.events[eventName] = []
        }
        this.events[eventName].push(cb)
    }
}







document.addEventListener("DOMContentLoaded", () => {

    const elements = {
        createButton: document.getElementById("task-button"),
        createBlock: document.getElementById("create-new-task-block"),
        done: document.getElementById("done"),
        inprogress: document.getElementById("inprogress"),
        savebutton: document.getElementById("save-button"),
        taskName: document.getElementById("task-name"),
        taskDescription: document.getElementById("task-description"),
        taskstatus: document.getElementById("task-status"),
        cancelButton: document.getElementById("cancel-button"),
        todo: document.getElementById("todo"),
        editButton: document.getElementById("edit-button"),
        delteButton: document.getElementById("delete-button"),
        actiondescription: document.getElementById("action-description")

    }
    // modify drag boxes 
    const boxes = []

    boxes.push(done)
    boxes.push(inprogress)
    boxes.push(todo)

    let draggedElement;
    let draggedElementID;

    for (const box of boxes) {
      box.addEventListener("dragenter", (e) => {
        e.preventDefault();
        e.target.classList.add('drag-over');
      });
      
      box.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.target.classList.add('drag-over');
      });
      
      box.addEventListener("dragleave", (e) => {
        e.target.classList.remove('drag-over');
      });
      
      box.addEventListener("dragstart", (e) => {
        draggedElement = e.target;
        draggedElementID = draggedElement.id
      });
      
      box.addEventListener("drop", (e) => {
        e.target.classList.remove('drag-over');
        e.preventDefault();
        const draggable = document.getElementById(draggedElementID)
        
        if (e.target.id === elements.todo.id || e.target.id === elements.inprogress.id || e.target.id === elements.done.id) {
          tasksModule.edit(draggedElementID, draggedElement.title, findDescriptionElement(draggable).innerText, e.target.id , creatCurrenTime());
        }
      });
    }

    elements.createBlock.classList.add("not-displayed")


    // "Hilfs" - Funktionen
    function deleteInput() {
        elements.taskName.value = ""
        elements.taskDescription.value = ""
        elements.taskstatus.value = "todo"

    }

    function toggleCreatewindow() {
        if (elements.createBlock.classList.contains("displayed")) {
            elements.todo.style.display = "block"
            elements.done.style.display = "block"
            elements.inprogress.style.display = "block"
            elements.createBlock.style.display = "none"
            elements.createButton.style.display = "block"

            elements.createBlock.classList.remove("displayed")
            elements.createBlock.classList.add("not-displayed")

        } else if (elements.createBlock.classList.contains("not-displayed")) {
            elements.todo.style.display = "none"
            elements.done.style.display = "none"
            elements.inprogress.style.display = "none"
            elements.createBlock.style.display = "block"
            elements.createButton.style.display = "none"

            elements.createBlock.classList.remove("not-displayed")
            elements.createBlock.classList.add("displayed")
        }

    }
    function findDescriptionElement(element) {
        var description = null
        for (var i = 0; i < element.childNodes.length; i++) {
            if (element.childNodes[i].className == "description") {
                element.childNodes[i]
                description = element.childNodes[i]
            }
        }
        return description
    }
    
    function creatCurrenTime(){
        let now = new Date();
        now.setHours(now.getHours() + 1);
        const current_time = now.toISOString().replace("Z", "+00:00");
        return current_time;
    }

    elements.createButton.addEventListener("click", (e) => {
        elements.savebutton.style.display = "block"
        elements.editButton.style.display = "none"
        elements.delteButton.style.display = "none"
        elements.actiondescription.innerText = "New Task"
        deleteInput()
        toggleCreatewindow()
    })
    

    elements.cancelButton.addEventListener("click", (e) => {
        const currentId = tasksModule.getElementIdByFormular(elements.taskName.value, elements.taskDescription.value, elements.taskstatus.value)
        const currentElement = document.getElementById(currentId)

        if (!currentElement) {
            deleteInput()
            toggleCreatewindow()
            return
        }
        if (currentElement.classList.contains("in-edit") && currentElement) {
            currentElement.classList.remove("in-edit")
        }
        if (elements.createButton.style.display = "none") {
            elements.createButton.style.display = "block"
        }


        deleteInput()
        toggleCreatewindow()
    })

    elements.savebutton.addEventListener("click", async (e) => {
        const inputName = elements.taskName.value
        const inputDesc = elements.taskDescription.value
        const inputStatus = elements.taskstatus.value
        var ToDoID = ""

        for (const task of tasksModule.tasks) {
            if (task.name === inputName && task.description === inputDesc) {
                alert("ToDo besteht bereits")
                toggleCreatewindow()
                deleteInput()
                return
            }
        }

        if (!inputName) {
            alert("Bitte eine ToDo-Beschreibung hinterlegen")
            return
        }

        var inputTask = {
            name: inputName,
            description: inputDesc,
            status: inputStatus,
            /* priority: priority,
             responsibility: responsibility,
             assignee: assignee,
             completed_at: completed_at,
             created_at: created_at
             external: external,*/
        }
        const inputString = await PostToDevApi(inputTask)
        const startIndex = inputString.indexOf('"') + 1;
        const endIndex = inputString.indexOf('"', startIndex);
        ToDoID = inputString.slice(startIndex, endIndex);
        tasksModule.add(ToDoID, inputName, inputDesc, inputStatus)
        deleteInput()
        toggleCreatewindow()
    })

    tasksModule.on("add", (task) => {
        const divElement = document.createElement("div")
        divElement.setAttribute("id",task.id)
        divElement.setAttribute("draggable", "true")
        divElement.classList.add("task")
        const spanElementTitle = document.createElement("span")
        spanElementTitle.setAttribute("title", task.name)
        spanElementTitle.innerHTML = task.name

        divElement.appendChild(spanElementTitle)

        const spanElementDesc = document.createElement("span")
        spanElementDesc.setAttribute("description", task.name)
        spanElementDesc.classList.add("description")
        spanElementDesc.setAttribute("hidden", "hidden")
        spanElementDesc.innerHTML = task.description

        divElement.appendChild(spanElementDesc)
        if (task.status === "done") {
            elements.done.appendChild(divElement)
        } else if (task.status === "todo") {
            elements.todo.appendChild(divElement)
        } else if (task.status === "inprogress") {
            elements.inprogress.appendChild(divElement)
        }

    })

    tasksModule.on("add", (task) => {
        const element = document.getElementById(task.id)
        element.addEventListener("click", (e) => {
            element.classList.add("in-edit")
            elements.createButton.style.display = "none"
            elements.taskName.value = task.name
            elements.taskDescription.value = task.description
            elements.taskstatus.value = task.status
            toggleCreatewindow()
            elements.savebutton.style.display = "none"
            elements.editButton.style.display = "block"
            elements.delteButton.style.display = "block"
            elements.actiondescription.innerText = "Edit Task"
        })

    })
    tasksModule.on("add", (task) => {
        const element = document.getElementById(task.id)

        element.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData('text/plain', e.target.classList[0].slice(5))
            setTimeout(() => {
                e.target.classList.add('hide')
            }, 0)
            element.classList.add("dragged")
        })
        element.addEventListener("dragend", (e) => {
            setTimeout(() => {
                e.target.classList.remove('hide')
            }, 0)
        })

    })

    elements.editButton.addEventListener("click", (e) => {
        const task = document.getElementsByClassName("in-edit")[0]
        const id = task.id
        var description = findDescriptionElement(task)

        if (elements.taskName.value) {
            tasksModule.edit(id, elements.taskName.value, elements.taskDescription.value, elements.taskstatus.value , creatCurrenTime())
            description.innerText = elements.taskDescription.value
        }

        task.classList.remove("in-edit")

        toggleCreatewindow()

        elements.savebutton.style.display = "block"
        elements.editButton.style.display = "none"

        deleteInput()
        elements.createButton.style.display = "block"

    })

    tasksModule.on("edit", (task) => {
        const element = document.getElementById(task.id)

        if (element.classList.contains("dragged")) {
            elements[task.status].append(element)
            element.classList.remove("dragged")
        } else {
            element.title = elements.taskName.value
            element.childNodes[0].textContent = elements.taskName.value
            element.description = elements.taskDescription.value

            if (element.parentNode.id !== task.status) {
                elements[task.status].append(element)
            }
        }
        element.classList.remove("in-edit")
    })

    elements.delteButton.addEventListener("click", (e) => {
        const task = document.getElementsByClassName("in-edit")[0]
        const taskId = task.id
        tasksModule.remove(taskId)
    })

    tasksModule.on("remove", (task) => {
       const element = document.getElementById(task.id)
        element.remove()
        toggleCreatewindow()
    })







   
//////////////////////////// Anbindung an die API //////////////////////////////////////

// Synchronisation mit der Dev API  

function GetTodosOfApi() {
    fetch("http://localhost:8081/todos", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            for (const todo of data) {
                var contains = false
                if(todo.status === "created" || todo.status === "on_hold"){
                    todo.status = "todo"
                }if (todo.status === "in_progress"){
                    todo.status = "inprogress"
                }
                for (var i = 0; i < tasksModule.tasks.length; i++) {
                    if (tasksModule.tasks[i].id === todo.id) {
                        contains = true
                        if(tasksModule.tasks[i].modiefiedAt < todo.modiefiedAt){
                            console.log("hallo" , tasksModule.tasks , todo)    
                            tasksModule.edit(todo.id , todo.title , todo.description , todo.status , todo.modiefiedAt , true)
                             }
                        break
                    }  
                }
                if (!contains){
                    tasksModule.add(todo.id.toString() , todo.title, todo.description, todo.status)
                }
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });

    setTimeout(GetTodosOfApi, 10000);
}
GetTodosOfApi();

// initialisierung von data machen!
async function PostToDevApi(task) {
    var StatusToSend = "";
    var ToDoID = null;
    if (task.external === true) {
        return;
    }

    const current_time = creatCurrenTime()

    var completed_at = "2000-01-20T01:00:00.000+00:00";
    if (task.status === "done") {
        completed_at = current_time;
    }
    if (task.status === "todo") {
        StatusToSend = "created";
    }
    if (task.status === "inprogress") {
        StatusToSend = "in_progress";
    }

    const data = {
        completed_at: completed_at,
        responsibility: "development",
        description: task.description,
        created_at: current_time,
        reporter: {
            firstname: "Bob",
            role: "development",
            surname: "Baumeister",
            id: 8,
            email: "bob.bau@example.com",
        },
        assignee: {},
        title: task.name,
        priority: "low",
        status: StatusToSend,
    };

    try {
        const response = await fetch("http://localhost:8081/todos", {
            method: "POST",
            body: JSON.stringify(data),
        });
        const responseData = await response.text();
        ToDoID = responseData;
        console.log("Success:", responseData);
    } catch (error) {
        console.error("Error:", error);
    }

    return ToDoID;
}


function PutToDevAPI(task){
    var StatusToSend = ""
    if(task.external === true){ // soll nur beim update von der GetTodosApi nicht schicken
        task.external = false
        return
    }

    const current_time = creatCurrenTime()

    var completed_at = "2000-01-20T01:00:00.000+00:00"
    if(task.status === "done"){
        completed_at = current_time
    }
    if(task.status === "todo"){
        StatusToSend = "created"
    }
    if (task.status === "inprogress"){
        StatusToSend = "in_progress"
    }

    const data = {
            "completed_at": completed_at,
            "responsibility": "development",
            "description": task.description,
            "created_at": current_time,
            "reporter": {
              "firstname": "Bob",
              "role": "development",
              "surname": "Baumeister",
              "id": 8,
              "email": "bob.bau@example.com"
            },
            "assignee": {},
            "title": task.name,
            "priority": "low",
            "status": StatusToSend    
          
    };
    fetch("http://localhost:8081/todos/" + task.id , {
        method: "PUT",
        body: JSON.stringify(data)
    })
        .then((response) => response.text())
        .then((data) => {
            console.log("Success", data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function DeleteToDevApi(task){
    fetch("http://localhost:8081/todos/" + task.id , {
        method: "DELETE",
    })
        .then((response) => response.text())
        .then((data) => {
            console.log("Success", data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}


// Put an die Dev Api, wenn ein Todo verändert wurde

    tasksModule.on("edit", (task) =>{
       PutToDevAPI(task) // put wird in api angezeigt
    })

// Delete an die Dev Api, wenn ein Todo gelöscht wurde

    tasksModule.on("remove" , (task)=>{
       DeleteToDevApi(task)
    })

})