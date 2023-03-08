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

    edit(id, name, description, status/*, priority , assignee , completed_at */, external = 'defaultValue') {
        for (const index in this.tasks) {
            const task = this.tasks[index]
            if (task.id === id) {
                task.name = name
                task.description = description
                task.status = status
                /* 
                task.priority: priority,
                task.assignee: assignee,
                task.completed_at: completed_at,*/
                task.external = external,
                this.emit("edit", task)
            }
        }
    },

    getElementID(name, description, status) {
        for (const element of this.tasks) {
            if (element.name === name && element.description === description && element.status === status) {
                return element.id
            }
        }
    },

    add(id ,name, description, status /*, priority , assignee */, external = 'defaultValue') {
        const task = {
            id: id,
            name: name,
            description: description,
            status: status,
            /* priority: priority,
             responsibility: responsibility,
             assignee: assignee,
             completed_at: completed_at,
             created_at: created_at*/
             external: external,
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

    let draggedElement; // Eine globale Variable zum Zwischenspeichern des gezogenen Elements
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
        // Hier speichern wir das gezogene Element in der globalen Variable `draggedElement`
        draggedElement = e.target;
        draggedElementID = draggedElement.classList[0].slice(5)
      });
      
      box.addEventListener("drop", (e) => {
        e.target.classList.remove('drag-over');
        e.preventDefault();
        //const id = e.dataTransfer.getData('text/plain');
        //const id = draggedElement.classList()
        const draggable = document.getElementsByClassName(`a-id:${draggedElementID}`)[0];
        console.log(draggable, "draggable", draggedElementID, "id", tasksModule.tasks);
        
        // Hier können Sie das `draggedElement`-Objekt verwenden, um die entsprechenden Aktionen auszuführen
        if (e.target.id === elements.todo.id || e.target.id === elements.inprogress.id || e.target.id === elements.done.id) {
          tasksModule.edit(draggedElementID, draggedElement.id, findDescriptionElement(draggable).innerText, e.target.id);
          // Hier verwenden wir das gespeicherte `draggedElement`-Objekt, um die entsprechenden Aktionen auszuführen
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
        console.log(element , "element 180")
        for (var i = 0; i < element.childNodes.length; i++) {
            if (element.childNodes[i].className == "description") {
                element.childNodes[i]
                description = element.childNodes[i]
            }
        }
        return description
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
        const currentId = tasksModule.getElementID(elements.taskName.value, elements.taskDescription.value, elements.taskstatus.value)
        const currentElement = document.getElementsByClassName(`a-id:${currentId}`)[0]

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

    elements.savebutton.addEventListener("click", (e) => {
        const inputName = elements.taskName.value
        const inputDesc = elements.taskDescription.value //hier in span reinschreiben?!
        const inputStatus = elements.taskstatus.value

        for (const task of tasksModule.tasks) {
            if (task.name === inputName && task.description === inputDesc) {
                alert("ToDo besteht bereits")
                toggleCreatewindow()
                deleteInput()
                return
            }
        }

        if (!inputName) {
            return
        }

        tasksModule.add(tasksModule.createElementID() , inputName, inputDesc, inputStatus)
        deleteInput()
        toggleCreatewindow()
    })
// aufräumen, spanelement id wird nicht genutzt und attribute id auch nicht ?!
    tasksModule.on("add", (task) => {
        const divElement = document.createElement("div")
        divElement.setAttribute("id", task.name)
        divElement.setAttribute("draggable", "true")
        //divElement.setAttribute("data" , task.description)
        divElement.classList.add("a-id" + ":" + tasksModule.getElementID(task.name, task.description, task.status))
        divElement.classList.add("task")
        //divElement.classList.add("description:" + task.description) // hier paragraph unterhalb dem divelement einbauen, evtl. display none
        const spanElementId = document.createElement("span")
        spanElementId.setAttribute("id", task.name)
        spanElementId.innerHTML = task.name

        divElement.appendChild(spanElementId)

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
        const element = document.getElementsByClassName(`a-id:${task.id}`)[0]
        console.log(element)
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
        const element = document.getElementsByClassName(`a-id:${task.id}`)[0]

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
        const id = task.classList[0].slice(5)
        var description = findDescriptionElement(task)

        if (elements.taskName.value) {
            tasksModule.edit(id, elements.taskName.value, elements.taskDescription.value
                , elements.taskstatus.value)
            //task.classList.replace(task.classList[2] , "description:" + elements.taskDescription.value)
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
        const element = document.getElementsByClassName(`a-id:${task.id}`)[0]

        if (element.classList.contains("dragged")) {
            elements[task.status].append(element)
            element.classList.remove("dragged")
        } else {
            element.id = elements.taskName.value
            element.childNodes[0].textContent = elements.taskName.value
            element.description = elements.taskDescription.value // evtl. hier das feld von description?!

            if (element.parentNode.id !== task.status) {
                elements[task.status].append(element)
            }
        }
        element.classList.remove("in-edit")
    })

    elements.delteButton.addEventListener("click", (e) => {
        const task = document.getElementsByClassName("in-edit")[0]
        const taskId = task.classList[0].slice(5)
        tasksModule.remove(taskId)
    })

    tasksModule.on("remove", (task) => {
        const element = document.getElementsByClassName(`a-id:${task.id}`)[0]
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
                    if (tasksModule.tasks[i].id === todo.id) { // kann noch nicht umgesetzt werden, da im backend das update noch nicht umgesetzt wurde
                        contains = true
                        //console.log(tasksModule.tasks[i].name , todo.title , tasksModule.tasks[i].description , todo.description , tasksModule.tasks[i].status , todo.status)
                        if(tasksModule.tasks[i].name !== todo.title || tasksModule.tasks[i].description !== todo.description || tasksModule.tasks[i].status !== todo.status /*|| tasksModule.tasks[i].priority !== todo.priority*/){
                            console.log("hallo" , tasksModule.tasks , todo)    
                           // tasksModule.edit(todo.id , todo.title , todo.description , todo.status , -1)
                             }
                        break
                    }  
                }
                if (!contains){
                    tasksModule.add(todo.id.toString() , todo.title, todo.description, todo.status , true)
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
function PostToDevApi(task){
    var StatusToSend = ""
    if(task.external === true){
        return
    }
    const now = new Date();
    const current_time = now.toISOString().replace("Z", "+00:00");

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
    fetch("http://localhost:8081/todos", {
        method: "POST",
        body: JSON.stringify(data)
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Success:", data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function PutToDevAPI(task){
    var StatusToSend = ""
    if(task.external === -1){ // soll nur beim update von der GetTodosApi nicht schicken
        task.external += 1
        return
    }

    const now = new Date();
    const current_time = now.toISOString().replace("Z", "+00:00");

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
        .then((response) => response.json())
        .then((data) => {
            console.log("Success:", data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function DeleteToDevApi(task){
    fetch("http://localhost:8081/todos/" + task.id , {
        method: "DELETE",
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Success:", data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

// neues ToDo posten

    tasksModule.on("add", (task) => {
        PostToDevApi(task)
    })

// Put an die Dev Api, wenn ein Todo verändert wurde

    tasksModule.on("edit", (task) =>{
       PutToDevAPI(task) // put wird in api angezeigt
    })

// Delete an die Dev Api, wenn ein Todo gelöscht wurde

    tasksModule.on("remove" , (task)=>{
        // task.status = "deleted"
        // PutToDevAPI(task)
       DeleteToDevApi(task) // delete wird in api angezeigt
    })

})