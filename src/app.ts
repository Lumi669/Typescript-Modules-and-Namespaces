//Drag & Drop Interface
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

// Project Type

enum ProjectStatus {
    Active,
    Finished
}
class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {}
}

// Project State Management, this is a function type
//type Listener = (items: Project[]) => void;

//now generic functiton type
type Listener<T> = (items: T[]) => void;

//create a base class for state management
class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}
// Create a singleton class
class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active
        );

        this.projects.push(newProject);
        this.updateListeners();
    }

    removeProject(projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find(prj => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners() {
        //the magic happen here, when new project come, every listener
        //will be called with argument of projects, so update e.g assignedProjects
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

// const projectState = new ProjectState(); //this way can create many instances

//this way can only create one instance which is global
const projectState = ProjectState.getInstance();

//Validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.minLength != null && typeof validatableInput.value === "string") {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value === "string") {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (validatableInput.min != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (validatableInput.max != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }

    return isValid;
}

//autobind decorator
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjustDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjustDescriptor;
}

//create a base class with common functionalities
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U; // there is no HTMLSectionElement, so use HTMLElement

    constructor(
        templateId: string,
        hostElementId: string,
        insertAtStart: boolean,
        newElementId?: string
    ) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;
        const importedNode = document.importNode(this.templateElement.content, true);

        //get the concrete element out of the template content
        this.element = importedNode.firstElementChild as U;

        // add an id
        if (newElementId) {
            this.element.id = `${newElementId}`;
        }
        this.attach(insertAtStart);
    }
    private attach(insertAtBeginning: boolean) {
        this.hostElement.insertAdjacentElement(
            insertAtBeginning ? "afterbegin" : "beforeend",
            this.element
        );
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

//ProjectItem Class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    private project: Project;

    //add a getter
    get persons() {
        if (this.project.people === 1) {
            return "1 person";
        } else {
            return `${this.project.people} persons`;
        }
    }

    @Autobind
    dragStartHandler(event: DragEvent) {
        event.dataTransfer!.setData("text/plain", this.project.id);
        event.dataTransfer!.effectAllowed = "move";
    }
    dragEndHandler(_: DragEvent) {
        console.log("drag end");
    }

    constructor(hostId: string, project: Project) {
        super("single-project", hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }

    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandler);
        this.element.addEventListener("dragend", this.dragEndHandler);
    }

    renderContent() {
        this.element.querySelector("h2")!.textContent = this.project.title;
        this.element.querySelector("h3")!.textContent = this.persons + " assigned";
        this.element.querySelector("p")!.textContent = this.project.description;
    }
}

// ProjectList Class
class ProjectList extends Component<HTMLTemplateElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
        super("project-list", "app", false, `${type}-projects`);
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }

    @Autobind
    dragOverHandler(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault();
            const listEl = this.element.querySelector("ul");
            listEl?.classList.add("droppable");
        }
    }

    @Autobind
    dropHandler(event: DragEvent) {
        const prjId = event.dataTransfer!.getData("text/plain");
        projectState.removeProject(
            prjId,
            this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
        );
    }

    @Autobind
    dragLeaveHandler(_3: DragEvent) {
        const listEl = this.element.querySelector("ul");
        listEl?.classList.remove("droppable");
    }

    configure() {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);
        this.element.addEventListener("drop", this.dropHandler);

        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => {
                if (this.type === "active") {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });

            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listEl.innerHTML = "";
        for (const prjItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector("ul")!.id, prjItem);

            // const listItem = document.createElement("Li");
            // listItem.textContent = prjItem.title;
            // listEl.appendChild(listItem);
        }
    }
}

class ProjectInput extends Component<HTMLDivElement, HTMLElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super("project-input", "app", true), "user-input";

        //access the 3 input elements in the class
        this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector(
            "#description"
        ) as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;
        this.configure();
    }

    configure() {
        //use "this" instead of "ProjectInput" for the bind argument !!!
        //this.element.addEventListener("submit", this.submitHandler.bind(this));

        //now use autobind decorator, so no need to use bind here
        this.element.addEventListener("submit", this.submitHandler);
    }

    renderContent(): void {}

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const tiltleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        };
        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        };

        if (
            !validate(tiltleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
        ) {
            alert("Invalid input!");
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    private clearInput() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }

    @Autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            console.log(title, desc, people);
            this.clearInput();
        }
    }
}

// create an instance, now in UI form shows
const prjInput = new ProjectInput();

//create an instance of active project list, now in UI should shows
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
