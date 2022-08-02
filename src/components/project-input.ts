/// <reference path="base-component.ts"/>

namespace App {
    export class ProjectInput extends Component<HTMLDivElement, HTMLElement> {
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
}
