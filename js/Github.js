(function () {
    var DEFAULT_API_URL = "https://api.github.com/";
    var Github = function (xhr, token, owner, repo, apiUrl) {
        this.xhr      = xhr;
        this.token    = token;
        this.basePath = ["repos", owner, repo].join("/") + "/";
        this.apiUrl   = apiUrl || DEFAULT_API_URL;

        if (!this.apiUrl.match(/\/$/)) {
            this.apiUrl += "/";
        }
    };

    Github.prototype.request = function(options, callback) {
        var method          = options.method || "GET",
            url             = this.apiUrl + options.path,
            body            = options.body || {},
            params          = options.params || {},
            headers         = options.headers || {},
            responseType    = options.responseType || "json",
            withCredentials = options.withCredentials || false;

        headers["Authorization"] = "token " + this.token;

        xhr.request({
            url:             url,
            method:          method,
            params:          params,
            body:            body,
            headers:         headers,
            responseType:    responseType,
            withCredentials: withCredentials,
            sync:            false,
            callback:        callback,
        });
    };

    Github.prototype.getOpenIssues = function(callback) {
        this.getIssues(callback);
    };

    Github.prototype.getClosedIssues = function(callback) {
        this.getIssues(callback, true);
    };

    Github.prototype.getIssues = function(callback, isClosed) {
        this.request({
            path: this.basePath + "issues",
            method: "GET",
            params: {
                state: isClosed ? "closed": "open",
            },
        }, callback);
    };

    Github.prototype.openIssue = function(number, callback) {
        this.editIssue(number, {
            state: "open",
        }, callback)
    };

    Github.prototype.closeIssue = function(number, callback) {
        this.editIssue(number, {
            state: "closed",
        }, callback);
    };

    Github.prototype.editTitle = function(title, number, callback) {
        this.editIssue(number, {
            title: title,
        }, callback);
    };

    Github.prototype.editIssue = function(number, params, callback) {
        this.request({
            path: this.basePath + "issues/" + number,
            method: "PATCH",
            body: JSON.stringify(params)
        }, callback);
    };

    Github.prototype.createIssue = function(title, callback) {
        this.request({
            path: this.basePath + "issues",
            method: "POST",
            body: JSON.stringify({
                title: title
            }),
        }, callback);
    }

    Github.prototype.test = function(options) {
        this.request({
            path: "repos/kuidaoring/todotest/milestones",
            method: "GET",
            callback: function(r) {
                console.dir(r);
            },
        });
    };

    window.Github = Github;
}());
