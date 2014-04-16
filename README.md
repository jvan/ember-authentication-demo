User authentication demo using [ember][ember].


## Installation

This application requires [node][node] and [grunt][grunt]. You can download
a node installer [here][node-download].

After installing node on your system, install the grunt command-line 
application.

```shell
sudo npm install -g grunt-cli
```

Once the necessary pacakges are installed, build the ember templates by 
running:

```shell
grunt build
```

[ember]: http://emberjs.com 
[node]: http://nodejs.org
[node-download]: http://nodejs.org/download/
[grunt]: http://gruntjs.com


### Running the application

Start the node server and then open [localhost:3000](http://localhost:3000) in your
web browser.

```shell
node server.js
```

Accessing the article data requires the user to log in to the system. There
are two accounts, one regular user and one administrator. 

#### regular user

* username: `user`
* password: `user`


#### administrator

* username: `admin`
* password: `admin`


Both users can view [published articles](http://localhost:3000/#/articles). The
administrator can additionally access a list of all articles (including
unpublished) on the [admin page](http://localhost:3000/#/admin).
