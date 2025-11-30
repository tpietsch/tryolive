# Running

docker-compose -f docker-compose-full.yaml or just docker build and run manually 

http://localhost/dog-breeds

The additional docker file I use for local dev because 
I like to run the FE/BE process separately for hot reloading and debugging tooling

# TODO
- implement accurate_entries
Because this api doesnt provide any metadata like total records in order to have correct paging with the number of entries selected we would need to 
manually page through until we got to the correct spot - this would be something like if our api had page_size and page (which it does)

if someone asks for 15 and the api call to https://interview-api-olive.vercel.app/api/dogs returns less - we need to call the next page to get more.
We also would need some heurstic to tell us to stop - assuming this would be the page that response without error and an empty array.

So until we either get to the correct window of page_size records OR we find an empty array response we manually continue to call the endpoint + move the 
redis caching to be more of a memoize for keep this behavior performant

There is an assumption with the above that the API itself is returning data in some order so each subsequent call to a page of data can be sure to be a new set
of data.

- check image 404s on backend replace if missing
- test coverage on fe/be
- use postgres instead of sqllite
- auth0, workos, + fastapi middlware for auth
- ...


# Product Reqs
- do we want to default if image urls are bad?
- do we want some behavior on missing or lengthy names?
- ..... prob some more granular questions to ask depending on the goals

# Infra

nginx for routing between the two apps
redis for cache

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

