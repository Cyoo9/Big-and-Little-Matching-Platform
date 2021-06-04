# Big & Little Matching Platform
Description:
A web application that matches two students (one big and one little) with desired interests, year, and major. 

Languages/Tools used:
Javascript, HTML, and CSS were used for the front-end. 
Express framework with PostgreSQL database were used for the back-end. 
Javascript ejs used for templating. 

Go to https://big-little-matching.herokuapp.comin to access our site

Features/Functions:

Google Captcha:
-  Must pass the captcha test when you first enter our website.
-  Implemented to avoid DDoS attacks and botting.

Login/Authentication:
-  Users can log in via google or their own username and password for the website. 
-  Can register and logout.
-  Can edit profile.
-  Passwords are hashed with bcrypt. 

Profiling:
-  Display list of all members wanting to pick up/be picked up.
-  Each user has their own unique profile with information they must fill out.
-  Hobbies
-  Year
-  Major
-  Big/Little

Dashboard:
-  Greets the current user that is logged in. 
-  Displays all the users in the database.

Searching:
-  Users can search for other users if the dashboard seems too much to scroll through. 
-  Can search by specific names or just Big and Little. 

Reputation:
-  Each user has a reputation based on how many likes he or she received.
-  Very popular users tend to have 10 or more likes.

Matching:
- When both users like each other, the matching pair will appear on their match list.
- Unliking a user will remove their message history and removed from the match list.

Messaging:
- When both users are matched, they are allowed to private message each other through the match list.
- Users can click on their match profile picture to view more of their match information.

Database:
-  We used postgresql as our database.
-  We implemented indexes BTREES for slight performance gains when using the GET method.
