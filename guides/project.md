# Project

Project Home is organized into four parts.

![Project, layout](/guides/images/project_layout.png)

---

## 1- Selected items bar

The top of a project layout display information on your selections.

### Project home icon

![Project, Home](/guides/images/project_home.png) Clicking this icon makes you navigate to the **Project Home**

### My projects navigation

![Project, My projects](/guides/images/project_to_myprojects.png)

The **Project name** on the rigth of the **Project Home** icon is an *input selector* that gives you access to **Your projects** list. Via this *selector* you can navigate to one of **Your Projects** without having to return on **My Projects** page.

### My selected project item

When you select an project item to display its properties, Its name will be displayed on the right of the current project.

---

## 2- Project Items Navigation Menu

> It is a **3** parts navigation menu
>
> - Applications
> - Groups
> - Scopes

### Application navigation

List of the project applications you can navigate to.

Running a **Mouse over** on an application item display an icon for a contextual menu

![Menu, Mouse over](/guides/images/project_application_menu.png)

Two actions can be applied to an application

![Menu, Mouse over](/guides/images/project_application_menu_display.png)

- Rename

> It reset the name of the application in **OKTA** and in **INTACT**.

- Delete

> Remove the Application from **OKTA** and **INTACT** but only when there isn't anymore group linked to it.

### Group navigation

List of the project groups you can navigate to.

Running a **Mouse over** on a group item display an icon for a contextual menu as for applications.

Fives actions can be applied to a group

 ![Menu, Mouse over](/guides/images/project_group_menu_display.png)

- Rename

> It reset the name of the group in **OKTA** and in **INTACT**.

- Lock/Unlock

> Locking a group makes its deletion imposible.
> Locking/Unlocking a group is a **Project Admin** right.

- As Global Admin

> The project itself and all its items have the selected group as single **Admin Group**.

- Copy To

> Every members of the source group will become a member of the target group if it isn't yet.

- Mail to

> It prepare an Outlook Web Access mail for all the group members
> **IMPORTANT**: You should type **Crtl + K** on the mail **To** list for **OWA** to decode the address list.

- Delete

> Group deletion is enabled only if there isn't anymore application linked to it.
>
> **IMPORTANT**: This is a deletion on **INTACT** only! the **group** still exists on **OKTA**.

### Scope navigation

List of the project scopes you can navigate to.

Running a **Mouse over** on a scope item display an icon for a contextual menu as for applications or groups.

A single action can be applied to a scope

- Delete

> Scope deletion is enabled only when there isn't anymore subscription on it: *internal* as *external*.

---

## 3- Definition Section

This part display the project **Description**.
It can be edited by a **Project Admin** only!

---

## 4- Project Graphs

It displays high level views on project definition.

 ![Project Graph, RuntimeMouse over](/guides/images/project-graph-runtime-button.png)
Displays **Operationals** dependencies:

- What *Groups* are provisionning *Applications's* users,
- What *Scopes (internal & external )* are used by *Applications*,
- What *External Application(s)* subscribes to *Internals Scopes*.

![Project Graph, RuntimeMouse over](/guides/images/project-graph-admin-button.png)
Displays **Security** dependencies:

- What *Admin Group(s)* rules accreditation over *Project's Items*.

![Project Graph, RuntimeMouse over](/guides/images/project-admin-button.png)
Displays **Project's Admin Group** Form *(Visible only for Proejct Admin)*:

- Allows to **Project's Admin Group** updates.

---
