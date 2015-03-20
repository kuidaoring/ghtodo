(function(){
    "use strict";

    var ENTER_KEYCODE = 13;
    var DEFAULT_API_URL = "https://api.github.com/";
    var DEFAULT_GITHUB_URL = "https://github.com/";
    var config;
    var gh;
    var xhr = document.getElementById("xhr");
    var template = document.querySelector('template[is="auto-binding"]');
    var meta;
    var transition;
    var loadingWrapper;

    template.selectedTab = 0;
    template.tabs = {
        todo: "",
        done: "",
        setting: "",
    };

    template.todoList = [];
    template.doneList = [];

    template.selectTodo = function() {
        listOpenIssues();
        selectTab("todo");
    };

    template.selectDone = function() {
        listClosedIssues();
        selectTab("done");
    };

    template.selectSetting = function() {
        selectTab("setting");
    };

    template.addTodo = function(e) {
        if(e.keyCode === undefined || isShiftEnter(e) || isCtrlEnter(e)) {
            if (isEmpty(template.newTodo)) {
                return;
            }
            createTodo(template.newTodo);
            template.newTodo = "";
        }
    };

    template.toDone = function(e) {
        var todo = e.target.templateInstance.model.todo;
        doneTodo(todo);
    };

    template.toTodo = function(e) {
        var done = e.target.templateInstance.model.done;
        backTodo(done);
    };

    template.saveConfig = saveConfig;

    template.addEventListener("template-bound", function() {

        setUpLoading();

        loadConfig();
        gh = createGithubInstance();
        if (!checkConfig()) {
            loadingWrapper.style.display = "none";
            template.selectedTab = 2;
            selectTab("setting");
        } else {
            selectTab("todo");
            listOpenIssues();
        }
    });

    function setUpLoading() {
        // transition setup
        meta = document.createElement("core-meta");
        meta.type = "transition";
        transition = meta.byId("core-transition-fade");

        var wrap    = document.querySelector("#loading-wrap"),
            loading = document.querySelector("#loading"),
            wh      = window.innerHeight,
            ww      = window.innerWidth;

        wrap.style.height = wh + "px";
        wrap.style.width  = ww + "px";

        loading.style.top = (wh / 2 - loading.clientHeight) + "px";
        loading.style.left = (ww / 2 - loading.clientWidth / 2) + "px";

        loadingWrapper = wrap;
        transition.setup(loadingWrapper);
    }

    function createTodo(name) {
        var newTodo = {
            name: name,
            status: "loading",
        };
        template.todoList.unshift(newTodo);
        gh.createIssue(name, function(issue) {
            newTodo.name = issue.title;
            newTodo.url  = issue.html_url;
            newTodo.number = issue.number;
            newTodo.status = "";
        });
    }

    function doneTodo(todo) {
        todo.status = "loading";
        gh.closeIssue(todo.number, function() {
            todo.status = "";
        });
    }

    function backTodo(done) {
        done.status = "loading";
        gh.openIssue(done.number, function() {
            done.status = "";
        });
    }

    function listOpenIssues() {
        startLoading();
        gh.getOpenIssues(function(issues) {
            template.todoList = [];
            if (issues.length !== undefined) {
                template.todoList.error = false;
                issues.forEach(function(issue) {
                    template.todoList.push({
                        name: issue.title,
                        number: issue.number,
                        url: issue.html_url,
                        status: "",
                    });
                });
            } else {
                // error
                template.todoList.error = true;
            }
            stopLoading();
        });
    }

    function listClosedIssues() {
        startLoading();
        gh.getClosedIssues(function(issues) {
            template.doneList = [];
            if (issues.length !== undefined) {
                template.doneList.error = false;
                issues.forEach(function(issue) {
                    template.doneList.push({
                        name: issue.title,
                        number: issue.number,
                        url: issue.html_url,
                        status: "",
                    });
                });
            } else {
                // error
                template.doneList.error = true;
            }
            stopLoading();
        });
    }

    function startLoading() {
        template.loading = "loading";
        transition.go(loadingWrapper, {opened: true});
        loadingWrapper.style.display = "block";
    }

    function stopLoading() {
        template.loading = "";
        transition.go(loadingWrapper, {opened: false});
        setTimeout(function() {
            loadingWrapper.style.display = "none";
        }, 1000);
    }

    function isShiftEnter(e) {
        if (e.shiftKey && (e.keyCode === ENTER_KEYCODE || e.charCode === ENTER_KEYCODE)) {
            return true;
        }
        return false;
    }

    function isCtrlEnter(e) {
        if (e.ctrlKey && (e.keyCode === ENTER_KEYCODE || e.charCode === ENTER_KEYCODE)) {
            return true;
        }
        return false;
    }

    function isEmpty(task) {
        if (task.match(/^[\s]*$/)) {
            return true;
        }
        return false;
    }

    function selectTab(tabName) {
        for (var tab in template.tabs) {
            template.tabs[tab] = "";
        }

        template.tabs[tabName] = "on";
    }

    function loadConfig() {
        if (localStorage.configData) {
            config = JSON.parse(localStorage.configData);
        } else {
            config = {
                apiUrl: DEFAULT_API_URL,
                githubUrl: DEFAULT_GITHUB_URL,
            };
        }
        template.config = config;
    }

    function checkConfig() {
        return (config
            && config.owner
            && config.repo
            && config.token
            && config.githubUrl
            && config.apiUrl
        );
    }

    function saveConfig() {
        template.config = config;
        template.configData = config;

        gh = createGithubInstance();
    }

    function createGithubInstance() {
        var gh = new Github(xhr, config.token, config.owner, config.repo, config.apiUrl);
        return gh;
    }
}());
