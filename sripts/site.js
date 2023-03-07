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

    edit(id, name, description, status/*, priority , responsibility , assignee , completed_at , created_at*/) {
        for (const index in this.tasks) {
            const task = this.tasks[index]
            if (task.id === id) {
                task.name = name
                task.description = description
                task.status = status
                /* 
                task.priority: priority,
                task.responsibility: responsibility,
                task.assignee: assignee,
                task.completed_at: completed_at,
                task.created_at: created_at*/
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

    add(name, description, status /*, priority , responsibility , assignee , completed_at , created_at*/, external = 'defaultValue') {
        const task = {
            id: this.createElementID(),
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

    for (const box of boxes) {
        box.addEventListener("dragenter", (e) => {
            e.preventDefault();
            e.target.classList.add('drag-over');
        })
        box.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.target.classList.add('drag-over');
        })
        box.addEventListener("dragleave", (e) => {
            e.target.classList.remove('drag-over');

        })
        box.addEventListener("drop", (e) => {
            e.target.classList.remove('drag-over');
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            const draggable = document.getElementsByClassName(`a-id:${id}`)[0]

            if (e.target.id === elements.todo.id || e.target.id === elements.inprogress.id || e.target.id === elements.done.id) {
                tasksModule.edit(id, draggable.id, findDescriptionElement(draggable).value, e.target.id) // hier ändern --> draggable.classList[2].slice(12)
            }

        })
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

        tasksModule.add(inputName, inputDesc, inputStatus)
        deleteInput()
        toggleCreatewindow()
    })

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
            e.dataTransfer.setData('text/plain', e.target.classList[0].slice(5, 6))
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
        const id = task.classList[0].slice(5, 6)
        var description = findDescriptionElement(task)

        if (elements.taskName.value) {
            tasksModule.edit(id, elements.taskName.value, elements.taskDescription.value
                , elements.taskstatus.value)
            //task.classList.replace(task.classList[2] , "description:" + elements.taskDescription.value)
            description.value = elements.taskDescription.value
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
            element.description = elements.taskDescription.value

            if (element.parentNode.id !== task.status) {
                elements[task.status].append(element)
            }
        }
        element.classList.remove("in-edit")
    })

    elements.delteButton.addEventListener("click", (e) => {
        const task = document.getElementsByClassName("in-edit")[0]
        const taskId = task.classList[0].slice(5, 6)
        tasksModule.remove(taskId)
    })

    tasksModule.on("remove", (task) => {
        const element = document.getElementsByClassName(`a-id:${task.id}`)[0]
        element.remove()
        toggleCreatewindow()
    })

    // Anbindung an die API
    tasksModule.on("add", (task) => {
        if(task.external === true){
            return
        }

        const data = {
                "completed_at": "2023-02-20T04:59:12.000+00:00",
                "responsibility": "development",
                "description": "This is the Description.",
                "created_at": "2023-02-10T18:23:01.000+00:00",
                "reporter": {
                  "firstname": "Bob",
                  "role": "development",
                  "surname": "Baumeister",
                  "id": 8,
                  "email": "bob.bau@example.com"
                },
                "id": 2,
                "assignee": {},
                "title": "This is the Title.",
                "priority": "low",
                "status": "created"    
              
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
    })

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
                    for (var i = 0; i < tasksModule.tasks.length; i++) {
                        console.log(tasksModule.tasks[i] ,1)
                        if (tasksModule.tasks[i].name === todo.title && tasksModule.tasks[i].description === todo.description && tasksModule.tasks[i].status === todo.status) {
                            contains = true
                            console.log(tasksModule.tasks[i],2)
                            break
                        }  
                    }
                    if (!contains){
                        console.log(tasksModule.tasks[i],3)
                        tasksModule.add(todo.title, todo.description, todo.status , true)
                    }
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });

        setTimeout(GetTodosOfApi, 10000);
    }
    GetTodosOfApi();


})