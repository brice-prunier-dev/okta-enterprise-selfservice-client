# New Application

Creating an **Application** is a four step process:

1. Select your OAuth flow.

    The more common choices are listed in our [WIKI - *( Ctrl+ Click to open in a new tab and keep your INTACT 'New Application' context)*](https://confluence.tools.digital.engie.com/display/DA/Consuming+APIs%3A+how+to+retrieve+an+OAuth+token).

    Click ![Next](/guides/images/next-button.png) to go to following step.

2. You need to fill the data for your OAuth entry.

    Upon your choice there are two possibilities:
    - Either it is a Service app and all you need is to fill the application name.

    - Or it is a Browser, Web or Native application and you need to fulfill this form:

    ![None service form](/guides/images/new-app-data.png)  

    - The choice of **Grant Types** is explained in our [WIKI - *( Ctrl+ Click to open in a new tab and keep your INTACT 'New Application' context)*](https://confluence.tools.digital.engie.com/display/DA/Consuming+APIs%3A+how+to+retrieve+an+OAuth+token).

    - **Login Url** should be the launching Url for your app ( NB: whith *Native* Client/Server app it should be a localhost )

    - **Redirect Urls** should get at least one entry. It should match an **Url pattern** or be one of these values : **com.oktapreview.gem-beta:** or **com.gemlive.com:**.

    - Click ![Next](/guides/images/next-button.png) to go to following step.

3. Enter a description for your Application.

    ![WIKI](/guides/images/new-app-description.png).

    > it may seems useless for the one creating the application but *please* it can be meaningfull when you are a new commers and you try to understand an eco-system (*few words are quite enougth*)

    Click ![Next](/guides/images/next-button.png) to go to following step.

4. At last choose which group(s) will get the **Application Admin** role.

    If everything is valid (*Cf. Application data Form*) ![Save](/guides/images/save-button.png) should be available.

    At the end of the creation query you will be redirect to the new Application's **Group & Users** panel to link existing groups to it.

---
