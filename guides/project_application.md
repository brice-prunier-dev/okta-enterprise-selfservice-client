# Project Application

## Detail

Application **Detail** page is the home for a **Project Application**:

![Project Application, Detail](/guides/images/project_application_detail.png)

This is the navigation for having selected an **Application** either in the *Project Navigation Menu* or on the  *Project Runtime Graph*.

It presents the Application's **OKTA** configuration.

> Being an Application Admin  give you the accredition to edit these data.

## Groups

![Project Application, Groups](/guides/images/project_application_groups.png)

It displays the list of user groups that are authorized to access the application.

> Being an Application Admin give you the accredition to see the full list of Project groups and to select the one that should be link to the application.  

> It exists two *implicit groups* that can be used despite the fact they are not in your project. These groups are **ENGIE** and **GEM**, they represent either all **ENGIE** users or all **GEM** users. Selecting one of these *implicit groups* make local groups useless as any of the user declare in a local group will be part of the implicit group.

## User

![Project Application, Groups](/guides/images/project_application_users.png)

It presents all the *Application's Members*.
You can read on the user row what group(s) make it a member of the application.

You have three ways to provision an **Application User** via INTACT:

- You search an ENGIE employee by its mail:
  - By selecting one in the *incremental search list*.
- You create a Service Account.  
- You create a Test Account.  

These three options display the **User Detail Dialog** where you have to select one or several groups the selected user should belong to.

> *Application's Users Page* is an alternate way for user provisionning. Insteat searching an user for a specific group you  assign the user to any groups linked to the application . 
**NB:** *being an admin of the group you will select is required.*

## API

![Project Application, Groups](/guides/images/project_application_api.png)

It presents the APIs used by the applications and for each API what scope has been subscribed by the **Application**.

![Project Application, Groups](/guides/images/project_application_api_detail.png)


> Being an Application Admin give you the accredition to subscrive to new scope(s). For that you need to click on **Manage APIs Subscribtions** button to display the **Application Scope Dialog**.


![Project Application, Groups](/guides/images/project_application_api_dialog.png)

With INTACT V5 you are no more limited in the choice of your scopes. A "Subscription Request" workflow is initiated for each new scope(s) you want to subscribe to.

- Either you're admin of the scope and the workflow will be auto validated.
- Or the scope is external and a mail is send to the scope's admins for for validation. 

> It exists a little *pre-requisite* to **Scope Subscription**: You need to fullfil the **Description** of your  **Project** and your **Application** first... *For your info it is supposed to be done at the creation of your application*. As a **Subscription Request** is send by maill to the **Scope Admins** the definition of the **Project** and the **Application** that will use the scope at runtime becomes mandatory.

By typing the name of the scope you need, you can add select a new scope into the list of scope allready declared.

At runtime a color code helps you to identify: 

- what scope is allready acquired,
- what scope has been already been requested and is pendind for approval
- what scope is just a new request

> By clicking on ![Scope, removal](/guides/images/remove-ships-button.png), you can remove a scope from the list.

> By validating the **Application Scope Dialog**, INTACT will ensure that what you see on the dialog is correctly applied on OKTA:

- The list of validated scope is the same as the ones declare in the policy.

- The list of scope that requires a validation has a "Scope Request" document for each of them, sent to the right Scope Admins.

## Definion

 ![Project Application, Definition](/guides/images/project_grp_definition.png)

It provides Application definition: name and description.

> Mandatory for **Scope Request**.  

> Being an Application Admin (or a Project Admin) give you the accredition to edit these data.  

## Admin

 ![Project Application, Definition](/guides/images/project_grp_admin.png)

It provides information on *Who can administrate* the current group.

> Being a Application Admin ( or a Project Admin)  give you the accredition to edit these data.
