# My Project

This page display the list of your projects:

![My Project, layout](/guides/images/my_projects.png)

---

## Add New Project

![New Project, button](/guides/images/new-project.png)
This button on the top right side is visible by Project Admin.
It displays a dialog to create a new Project with yourself as Admin.
![New Project, dialog](/guides/images/new-project-dialog.png)
Project identifier should be **token**. A **token** is a meaningfull identifier lower case without spaces and any special characters to avoid any comparaison issue. Use a dash ('-' ) as word separator when necessary. **Token** format makes identifier easy to use and to read in urls.

Project description is mandatory. A text with a minimum of 15 characters is required to provide a meaning full definition.

## Personal Project

The first of **Card** is your **Personal project**:

It is created by default so you don't need to explicitly create it.

A **Personal project** comes with a group named **Me** where you are the only member.

**Me** group is set as _Admin_ of your **Personal project**. You should use it to make yourself _Admin_ of every item you'll need to create.

Today you need to explicitly set **Me** as _Admin_ when you create a project item: _Next release will enforce **Me** by default on every item_.

For safety reason on each new session **Me** is re-set as **Admin** on every item to guaranty you keep the ownership on your project.

> **Me** group is _Locked_ and so can't be _Deleted_

        - You can't add somebody else in **Me** group as well.

A **Personal project** provides you a context where you can prototype applications, groups and scopes. You are granted to subscribe to your ownn scope.

Within a **Personal project** you can work out the _Security settings_ for a complete developement project as long you don't need _external_ scopes.

---

## My other projects

After your **Personal project**, **My Projects** display any projects where you have a role and give you access to them.

### Project roles

#### **Project Admin**

- **Create/Delete** project's items,
- Manage project's items **Admins**,
- **Lock/Unlocked** a groups,
- Edit project's **Definition**.

#### **Application Admin**

- OKTA data management,
- **Link/unlink** groups to the application,
- **Subscribe/Unsubscribe** to a project **Scope**,
- Query for an external subscribtion,
- Edit application's **Definition**.

#### **Group Admin**

- Manage group's members **Provisionning**.

#### **Scope Admin**

- Managed _External subscription query_
- Edit scope **Definition**.

---

## Usage

By clicking on the **Consult** button of a project card you navigate to its detail.
![My Project, Consult](/guides/images/my_project_consult.png)

---
