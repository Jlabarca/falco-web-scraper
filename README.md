# Falco Web Scraper

Configurable web scraper
Cheerio - Nightmarejs - MongoDB

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
 Mongo reads connection string from ./db.config
 
 Database structure sample inside /db folder, a db with configuration, snapshots and users collections is required

 # Dynamic web scraper

 Uses nightmarejs, using electron needs xvfb:

 ``` 
 apt-get update &&\
 apt-get install -y libgtk2.0-0 libgconf-2-4 \
 libasound2 libxtst6 libxss1 libnss3 xvfb

 DEBUG=nightmare xvfb-run --server-args="-screen 0 1024x768x24" node falco.js  | ./node_modules/.bin/bunyan
 ```

