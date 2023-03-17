"use strict"


const tasksModule = {
    tasks: [],
    add(id = 'defaultValue', name, description, status , priority , assignee , reporter , modifiedAt , created_at , completed_at) {
        const task = {
            id: id,
            name: name,
            description: description,
            status: status,
            modifiedAt: modifiedAt,
            priority: priority,
            assignee: assignee,
            reporter: reporter,
            created_at: created_at,
            completed_at: completed_at
        }
        this.tasks.push(task)
        this.emit("add", task)
    },
    edit(id, name, description, status, modifiedAt , priority , assignee , completed_at , external = 'defaultValue') {
        for (const index in this.tasks) {
            const task = this.tasks[index]
            if (task.id === id) {
                task.name = name
                task.description = description
                task.status = status
                task.modifiedAt = modifiedAt
                task.priority= priority
                if(typeof(assignee)!= Boolean){
                    task.assignee= assignee
                }
                task.completed_at= completed_at,
                task.external = external,
                this.emit("edit", task)
            }
        }
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
    },
    getElementIdByFormular(name, description, status) {
        for (const element of this.tasks) {
            if (element.name === name && element.description === description && element.status === status) {
                return element.id
            }
        }
    },
    getTaskbyID(id){
        var taskToReturn
        for (const index in this.tasks) {
            const task = this.tasks[index]
            if (task.id === id) {
                taskToReturn = task
            }
        } return taskToReturn
    },

     creatCurrenTime() {
        let now = new Date();
        const current_time = now.toISOString().replace("Z", "+00:00");
        return current_time;
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
        tasksPriority: document.getElementById("task-priority"),
        tasksAssignee: document.getElementById("task-assignee"),
        tasksReporter: document.getElementById("task-reporter"),
        cancelButton: document.getElementById("cancel-button"),
        historyButton: document.getElementById("history-button"),
        todo: document.getElementById("todo"),
        editButton: document.getElementById("edit-button"),
        delteButton: document.getElementById("delete-button"),
        actiondescription: document.getElementById("action-description")

    }
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

        box.addEventListener("drop", async (e) => {
            e.target.classList.remove('drag-over');
            e.preventDefault();
            const newStatus = e.target.id
            const draggable = tasksModule.getTaskbyID(draggedElementID)

            if (newStatus === elements.todo.id || newStatus === elements.inprogress.id || newStatus === elements.done.id) {
                var modifiTime = await PutToDevAPI(draggedElementID, draggable.name, draggable.description, newStatus , draggable.priority)
                const startIndex = modifiTime.indexOf('"') + 1;
                const endIndex = modifiTime.indexOf('"', startIndex);
                modifiTime = modifiTime.slice(startIndex, endIndex);
               tasksModule.edit(draggedElementID, draggable.name, draggable.description, newStatus, modifiTime , draggable.priority , draggable.assignee);
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
        const inputPriority = elements.tasksPriority.value
        const inputAssignee = elements.tasksAssignee.value
        const inputReporter = elements.tasksReporter.value
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
            alert("Bitte ein ToDo-Namen hinterlegen")
            return
        }

        var inputTask = {
            name: inputName,
            description: inputDesc,
            status: inputStatus,
            priority: inputPriority,
            assignee: inputAssignee,
        }
        const inputString = await PostToDevApi(inputTask)
        const startIndex = inputString.indexOf('"') + 1;
        const endIndex = inputString.indexOf('"', startIndex);
        ToDoID = inputString.slice(startIndex, endIndex);
        tasksModule.add(ToDoID, inputName, inputDesc, inputStatus , inputPriority , inputAssignee , inputReporter , tasksModule.creatCurrenTime() , tasksModule.creatCurrenTime())
        deleteInput()
        toggleCreatewindow()
    })

    elements.historyButton.addEventListener("click", async (e) => {
        const currentId = tasksModule.getElementIdByFormular(elements.taskName.value, elements.taskDescription.value, elements.taskstatus.value)
        const message = getHistoryOfTodo(currentId).toString()

        alert(message)

    })

    elements.editButton.addEventListener("click", async (e) => {
        const task = document.getElementsByClassName("in-edit")[0]
        const id = task.id


        if (elements.taskName.value) {
            var modifiTime = await PutToDevAPI(id, elements.taskName.value, elements.taskDescription.value, elements.taskstatus.value , elements.tasksPriority.value)
            const startIndex = modifiTime.indexOf('"') + 1;
            const endIndex = modifiTime.indexOf('"', startIndex);
            modifiTime = modifiTime.slice(startIndex, endIndex);
            tasksModule.edit(id, elements.taskName.value, elements.taskDescription.value, elements.taskstatus.value , modifiTime , elements.tasksPriority.value , elements.tasksAssignee.value)
        }

        task.classList.remove("in-edit")

        toggleCreatewindow()

        elements.savebutton.style.display = "block"
        elements.editButton.style.display = "none"

        deleteInput()
        elements.createButton.style.display = "block"

    })

    elements.delteButton.addEventListener("click", (e) => {
        const task = document.getElementsByClassName("in-edit")[0]
        const taskId = task.id
        tasksModule.remove(taskId)
    })

    tasksModule.on("add", (task) => {
        const divElement = document.createElement("div")
        divElement.setAttribute("id", task.id)
        divElement.setAttribute("draggable", "true")
        divElement.classList.add("task")
        const spanElementTitle = document.createElement("span")
        spanElementTitle.classList.add("title")
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
            elements.tasksAssignee.value = task.assignee
            elements.tasksPriority.value = task.priority
            elements.tasksReporter.value = task.reporter.emails
            toggleCreatewindow()
            elements.savebutton.style.display = "none"
            elements.editButton.style.display = "block"
            elements.historyButton.style.display = "block"
            elements.delteButton.style.display = "block"
            elements.actiondescription.innerText = "Edit Task"
        })

    })
    tasksModule.on("add", (task) => {
        const element = document.getElementById(task.id)

        element.addEventListener("dragstart", (e) => {
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

    tasksModule.on("edit", (task) => {
        const element = document.getElementById(task.id)
        const titleInDom = 0
        const descriptionInDom = 1

        if (element.classList.contains("dragged")) {
            elements[task.status].append(element)
            element.classList.remove("dragged")
        } else if(task.external === true){
            element.childNodes[titleInDom].textContent = task.name
            element.childNodes[descriptionInDom].textContent = task.description
        }else {
            element.title = elements.taskName.value
            element.childNodes[titleInDom].textContent = elements.taskName.value
            element.childNodes[descriptionInDom].textContent = elements.taskDescription.value
            element.description = elements.taskDescription.value

            if (element.parentNode.id !== task.status) {
                elements[task.status].append(element)
            }
        }
        element.classList.remove("in-edit")
    })

    tasksModule.on("edit" , (task) =>{
        const taskInDom = document.getElementById(task.id)
        if(task.external === true){
            if(taskInDom.parentElement.id !== task.status){
                taskInDom.remove()
                elements[task.status].append(taskInDom)
            }
        }
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
                    if (todo.status === "created" || todo.status === "on_hold") {
                        todo.status = "todo"
                    } if (todo.status === "in_progress") {
                        todo.status = "inprogress"
                    }
                    for (var i = 0; i < tasksModule.tasks.length; i++) {
                        if (tasksModule.tasks[i].id === todo.id) {
                            contains = true
                            const DateInterTask = new Date(tasksModule.tasks[i].modifiedAt)
                            const DateExternTodo = new Date(todo.modified_at)
                            if (DateInterTask < DateExternTodo) {
                                console.log(todo.id, todo.title, todo.description, todo.status, todo.modified_at)
                                tasksModule.edit(todo.id, todo.title, todo.description, todo.status, todo.modified_at, todo.priority , todo.assignee , todo.completed_at, true)
                            }
                            break
                        }
                    }
                    if (!contains) {
                        tasksModule.add(todo.id.toString(), todo.title, todo.description, todo.status, todo.priority, "", todo.reporter, todo.modified_at , todo.created_at , todo.completed_at)
                    }
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });

        setTimeout(GetTodosOfApi, 10000);
    }
    GetTodosOfApi();

    async function PostToDevApi(task) {
        var StatusToSend = "";
        var ToDoID = null;
        if (task.external === true) {
            return;
        }

        const current_time = tasksModule.creatCurrenTime()

        var completed_at = "2000-01-20T01:00:00.000+00:00";
        if (task.status === "done") {
            StatusToSend = "done";
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
            priority: task.priority,
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

    async function PutToDevAPI(id, title, description, status , priority , assignee) {
        var StatusToSend = "";
        var ToDoID = null;

        console.log(priority , "prio")

        const current_time = tasksModule.creatCurrenTime()

        var completed_at = "2000-01-20T01:00:00.000+00:00";
        if (status === "done") {
            StatusToSend = "done";
            completed_at = current_time;
        }
        if (status === "todo") {
            StatusToSend = "created";
        }
        if (status === "inprogress") {
            StatusToSend = "in_progress";
        }

        const data = {
            completed_at: completed_at,
            responsibility: "development",
            description: description,
            created_at: current_time,
            reporter: {
                firstname: "Bob",
                role: "development",
                surname: "Baumeister",
                id: 8,
                email: "bob.bau@example.com",
            },
            assignee: {},
            title: title,
            priority: priority,
            status: StatusToSend,
        };

        try {
            const response = await fetch("http://localhost:8081/todos/" + id, {
                method: "PUT",
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

    function DeleteToDevApi(task) {
        var StatusToSend = "";
        var ToDoID = null;
        if (task.external === true) {
            return;
        }

        const current_time = tasksModule.creatCurrenTime()

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
        fetch("http://localhost:8081/todos/" + task.id, {
            method: "DELETE",
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

    function getHistoryOfTodo(id) {
        fetch("http://localhost:8081/history/" + id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                return data
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
    tasksModule.on("remove", (task) => {
        DeleteToDevApi(task)
    })

})