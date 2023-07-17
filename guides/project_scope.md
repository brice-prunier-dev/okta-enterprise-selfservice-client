# Project Scope

## Detail

Scope **Detail** page displays all the **Subscriptions** that exists for the present scope.

It is presented as a list of extendable informations:

- the **collapsed** view display the names of the project and the application that is subscribing.
  - a tag indicates if the subscription is local to the project or external.
  - An icon indicate the **status**.
- the **expanded** view display all the informations relative to the **Subscription**.
  - You can navigate either to the requesting **Project** or **Application**.
  - You can see the history of the **Subscription** 
  - Most of all you can operate the **Subscription** according its **status**.

A **Subscription** may have four different status:

- **Active**: It is waitting to be validated or rejected.
- **Validated**: The scope is part of the **OKTA Policy** that exists for the requesting application.
- **Rejected**: The request has been refused, a comment is then mandatory to explain the refusal.
- **Canceled**: The request has been terminated after having been approved, a comment is then mandatory to explain the termination.
    - *A classical use case for **Cancelled** is an abusive usage of an API*... 




![Project Scope, Detail](/guides/images/project_scp_detail.png)
 

## Definion

It provides Scope definition: name and description.

> Being a Scope Admin ( or a Project Admin) give you the accredition to edit these data.  

 ![Project Scope, Definition](/guides/images/project_scp_definition.png)


## Admin

It provides information on *Who can administrate* the current scope.

> Being a Scope Admin ( or a Project Admin)  give you the accredition to edit these data.

 ![Project Scope, Definition](/guides/images/project_scp_admin.png)


