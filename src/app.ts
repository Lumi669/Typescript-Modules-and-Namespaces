///<reference path="./components/project-input.ts"/>
///<reference path="./components/project-list.ts"/>

namespace App {
    // Project Type

    // create an instance, now in UI form shows
    new ProjectInput();

    //create an instance of active project list, now in UI should shows
    new ProjectList("active");
    new ProjectList("finished");
}
