# Running

docker-compose -f docker-compose-full.yaml or just docker build and run manually 


The additional docker file I use for local dev because 
I like to run the FE/BE process separately for hot reloading and debugging tooling

# Product Reqs
- do we want to default if image urls are bad?
- do we want some behavior on missing or lengthy names?
- ..... prob some more gran questions to ask depending on the goals

# Backend

FastAPI backend - gunicorn for running app
SQL model for orm
SQLLite for db

http://localhost/api/docs

# Frontend

https://tailadmin.com/ - based with some slight component modifications for this use case

http://localhost/dog-breeds 

# Match theme
AI generated theme from screenshot of site

# AI
Maybe for any missing data we can sub some ai gen things or have a 
static set of AI gen images or existing image/breed data to pull from.

indicating to the user its a guess? - reaching a bit here to show the "AI" use case but not sure its really here

# TODO
- check image 404s on backend replace if missing
- test coverage on fe/be
- use postgres instead of sqllite
- auth0, workos, + fastapi middlware for auth
- ...
