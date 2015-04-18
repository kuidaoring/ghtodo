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

        // ignore cache
        params._t = (new Date()).getTime();

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

    Github.prototype.getOpenIssues = function(callback, sort) {
        this.getIssues(callback, {
            isClosed: false,
            sort: sort,
        });
    };

    Github.prototype.getClosedIssues = function(callback, sort) {
        this.getIssues(callback, {
            isClosed: true,
            sort: sort,
        });
    };

    Github.prototype.getIssues = function(callback, options) {
        var isClosed  = options.isClosed,
            sort      = options.sort,
            direction = "desc";

        this.request({
            path: this.basePath + "issues",
            method: "GET",
            params: {
                state:      isClosed ? "closed": "open",
                sort:       sort,
                direction:  direction,
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

    window.Github = Github;
}());
