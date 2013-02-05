# Mojito Hybrid Example Application

Check out the application.

    git clone git@git.corp.yahoo.com:mps-demo/cuppajoe.git

## Install The App

You will need [nodejs](http://nodejs.org/) and [npm](https://npmjs.org/) installed to do this.

	cd app
	npm i

## Run with a Mojito Server

Start the server;

    > ./scripts/start-server

Open in a web browser [http://localhost:8666/](http://localhost:8666/).

## Dev Setup

These instructions are for setting up your development environment so you can submit "Pull Requests" on the [Cuppa Joe](http://cuppajoe.trunk.development.manhattan.gq1.yahoo.com/) application. You will require the following to be installed before you start;

* [git](http://git-scm.com/)
* [nodejs](http://nodejs.org/)
* [nvm](https://npmjs.org/) (installed with NodeJS as of 0.6.3)

Fork the https://git.corp.yahoo.com/mps-demo/cuppajoe project to your own git.corp account then clone it locally;

	git@git.corp.yahoo.com:<your_account>/cuppajoe.git
    cd ./cuppajoe

Hookup your clone to the main repo so you can keep them in sync;

	git remote add upstream git@git.corp.yahoo.com:mps-demo/cuppajoe.git
	git fetch upstream
	git push origin master

Create a branch for your changes;

	git checkout -b mybranch

Test your branch works by installing and running the application;

	cd ./app
	npm i
	cd ../
	./scripts/start-server

Now open http://127.0.0.1:8666/ in a browser to see the application running (use "control c" to stop it).

Make some changes and commit back to your git.corp repo. For the example update the README.md file with your email address under _List of Forkers_. Always run your unit tests before a commit.

	./scripts/test-app
	git commit -a -m "Readme update."
	git push origin mybranch

Sync your local clone with the main repo then push the changes back to your git.corp repo;

	git fetch upstream
	git merge upstream/master
	git push origin mybranch

To send a "Pull Request" with your changes go to your git.corp repo page. Make sure you are viewing the correct branch from the drop-down just above the files table (branch: mybranch). Then click the "Pull Request" button to the right of the project name. Follow the instructions to complete.

Once the "Pull Request" is sent it will trigger a Screwdriver CI job. This can be seen from the "Pull Request" page at the bottom of the "Discussion" tab. Once successful there will be a green bar saying "This pull request can be automatically merged" (it may take a few minutes to start the job the first time). The details of the Screwdriver CI system can be seen here http://screwdriver.corp.yahoo.com/projects/639.

With a successfully tested "Pull Request" it can now be merged into the master branch. This is done by clicking the "Merge pull request" button. The process will trigger a Screwdriver CI job and on success will push the new code to Manhattan on the URL http://cuppajoe.trunk.development.manhattan.gq1.yahoo.com/.

## List of Forkers

* [Ric Allinson](mailto:allinson@yahoo-inc.com)
* [Yujun Qian](mailto:yjqian@yahoo-inc.com)
