# Falco Web Scraper

The idea is to given an specfic URL be able to scrap data and detect changes.

# To Do:

- [X] Cheerio static web scraper
- [X] Electron dynamic web scraper
- [X] DB configuration
- [X] Implement data change detection
- [X] Email
- [X] Users
- [ ] Frontend
- [ ] Typescript
 
 # Database
 Uses Mongodb, reads connection string from ./db.config
 database structure inside /db folder

 configuration, snapshots and users are collections

 # Dynamic web scraper

 Uses nightmarejs, using electron needs xvfb:

 ``` 
 apt-get update &&\
 apt-get install -y libgtk2.0-0 libgconf-2-4 \
 libasound2 libxtst6 libxss1 libnss3 xvfb

 DEBUG=nightmare xvfb-run --server-args="-screen 0 1024x768x24" node falco.js  | ./node_modules/.bin/bunyan
 ```

