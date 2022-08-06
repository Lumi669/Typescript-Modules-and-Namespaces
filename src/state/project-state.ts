import { Project } from "../models/project.js";
import { ProjectStatus } from "../models/project.js";

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
export class ProjectState extends State<Project> {
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
export const projectState = ProjectState.getInstance();
