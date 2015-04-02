var haste_document = function() {
    this.locked = !1
};
haste_document.prototype.htmlEscape = function(e) {
    return e.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
}, haste_document.prototype.load = function(e, t, n) {
    var r = this;
    $.ajax("/documents/" + e, {
        type: "get",
        dataType: "json",
        success: function(i) {
            r.locked = !0, r.key = e, r.data = i.data;
            try {
                var s;
                n === "txt" ? s = {
                    value: r.htmlEscape(i.data)
                } : n ? s = hljs.highlight(n, i.data) : s = hljs.highlightAuto(i.data)
            } catch (o) {
                s = hljs.highlightAuto(i.data)
            }
            t({
                value: s.value,
                key: e,
                language: s.language || n,
                lineCount: i.data.split("\n").length
            })
        },
        error: function(e) {
            t(!1)
        }
    })
}, haste_document.prototype.save = function(e, t) {
    if (this.locked) return !1;
    this.data = e;
    var n = this;
    $.ajax("/documents", {
        type: "post",
        data: e,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(r) {
            n.locked = !0, n.key = r.key;
            var i = hljs.highlightAuto(e);
            t(null, {
                value: i.value,
                key: r.key,
                language: i.language,
                lineCount: e.split("\n").length
            })
        },
        error: function(e) {
            try {
                t($.parseJSON(e.responseText))
            } catch (n) {
                t({
                    message: "Something went wrong!"
                })
            }
        }
    })
};
var haste = function(e, t) {
    this.appName = e, this.$textarea = $("textarea"), this.$box = $("#box"), this.$code = $("#box code"), this.$linenos = $("#linenos"), this.options = t, this.configureShortcuts(), this.configureButtons(), t.twitter || $("#box2 .twitter").hide()
};
haste.prototype.setTitle = function(e) {
    var t = e ? this.appName + " - " + e : this.appName;
    document.title = t
}, haste.prototype.showMessage = function(e, t) {
    var n = $('<li class="' + (t || "info") + '">' + e + "</li>");
    $("#messages").prepend(n), setTimeout(function() {
        n.slideUp("fast", function() {
            $(this).remove()
        })
    }, 3e3)
}, haste.prototype.lightKey = function() {
    this.configureKey(["new", "save"])
}, haste.prototype.fullKey = function() {
    this.configureKey(["new", "duplicate", "twitter", "raw"])
}, haste.prototype.configureKey = function(e) {
    var t, n = 0;
    $("#box2 .function").each(function() {
        t = $(this);
        for (n = 0; n < e.length; n++)
            if (t.hasClass(e[n])) return t.addClass("enabled"), !0;
        t.removeClass("enabled")
    })
}, haste.prototype.newDocument = function(e) {
    this.$box.hide(), this.doc = new haste_document, e || window.history.pushState(null, this.appName, "/"), this.setTitle(), this.lightKey(), this.$textarea.val("").show("fast", function() {
        this.focus()
    }), this.removeLineNumbers()
}, haste.extensionMap = {
    rb: "ruby",
    py: "python",
    pl: "perl",
    php: "php",
    scala: "scala",
    go: "go",
    xml: "xml",
    html: "xml",
    htm: "xml",
    css: "css",
    js: "javascript",
    vbs: "vbscript",
    lua: "lua",
    pas: "delphi",
    java: "java",
    cpp: "cpp",
    cc: "cpp",
    m: "objectivec",
    vala: "vala",
    cs: "cs",
    sql: "sql",
    sm: "smalltalk",
    lisp: "lisp",
    ini: "ini",
    diff: "diff",
    bash: "bash",
    sh: "bash",
    tex: "tex",
    erl: "erlang",
    hs: "haskell",
    md: "markdown",
    txt: "",
    coffee: "coffee",
    json: "javascript"
}, haste.prototype.lookupExtensionByType = function(e) {
    for (var t in haste.extensionMap)
        if (haste.extensionMap[t] === e) return t;
    return e
}, haste.prototype.lookupTypeByExtension = function(e) {
    return haste.extensionMap[e] || e
}, haste.prototype.addLineNumbers = function(e) {
    var t = "";
    for (var n = 0; n < e; n++) t += (n + 1).toString() + "<br/>";
    $("#linenos").html(t)
}, haste.prototype.removeLineNumbers = function() {
    $("#linenos").html("&gt;")
}, haste.prototype.loadDocument = function(e) {
    var t = e.split(".", 2),
        n = this;
    n.doc = new haste_document, n.doc.load(t[0], function(e) {
        e ? (n.$code.html(e.value), n.setTitle(e.key), n.fullKey(), n.$textarea.val("").hide(), n.$box.show().focus(), n.addLineNumbers(e.lineCount)) : n.newDocument()
    }, this.lookupTypeByExtension(t[1]))
}, haste.prototype.duplicateDocument = function() {
    if (this.doc.locked) {
        var e = this.doc.data;
        this.newDocument(), this.$textarea.val(e)
    }
}, haste.prototype.lockDocument = function() {
    var e = this;
    this.doc.save(this.$textarea.val(), function(t, n) {
        if (t) e.showMessage(t.message, "error");
        else if (n) {
            e.$code.html(n.value), e.setTitle(n.key);
            var r = "/" + n.key;
            n.language && (r += "." + e.lookupExtensionByType(n.language)), window.history.pushState(null, e.appName + "-" + n.key, r), e.fullKey(), e.$textarea.val("").hide(), e.$box.show().focus(), e.addLineNumbers(n.lineCount)
        }
    })
}, haste.prototype.configureButtons = function() {
    var e = this;
    this.buttons = [{
        $where: $("#box2 .save"),
        label: "Save",
        shortcutDescription: "control + s",
        shortcut: function(e) {
            return e.ctrlKey && e.keyCode === 83
        },
        action: function() {
            e.$textarea.val().replace(/^\s+|\s+$/g, "") !== "" && e.lockDocument()
        }
    }, {
        $where: $("#box2 .new"),
        label: "New",
        shortcut: function(e) {
            return e.ctrlKey && e.keyCode === 78
        },
        shortcutDescription: "control + n",
        action: function() {
            e.newDocument(!e.doc.key)
        }
    }, {
        $where: $("#box2 .duplicate"),
        label: "Duplicate & Edit",
        shortcut: function(t) {
            return e.doc.locked && t.ctrlKey && t.keyCode === 68
        },
        shortcutDescription: "control + d",
        action: function() {
            e.duplicateDocument()
        }
    }, {
        $where: $("#box2 .raw"),
        label: "Just Text",
        shortcut: function(e) {
            return e.ctrlKey && e.shiftKey && e.keyCode === 82
        },
        shortcutDescription: "control + shift + r",
        action: function() {
            window.location.href = "/raw/" + e.doc.key
        }
    }, {
        $where: $("#box2 .twitter"),
        label: "Twitter",
        shortcut: function(t) {
            return e.options.twitter && e.doc.locked && t.shiftKey && t.ctrlKey && t.keyCode == 84
        },
        shortcutDescription: "control + shift + t",
        action: function() {
            window.open("https://twitter.com/share?url=" + encodeURI(window.location.href))
        }
    }];
    for (var t = 0; t < this.buttons.length; t++) this.configureButton(this.buttons[t])
}, haste.prototype.configureButton = function(e) {
    e.$where.click(function(t) {
        t.preventDefault(), !e.clickDisabled && $(this).hasClass("enabled") && e.action()
    }), e.$where.mouseenter(function(t) {
        $("#box3 .label").text(e.label), $("#box3 .shortcut").text(e.shortcutDescription || ""), $("#box3").show(), $(this).append($("#pointer").remove().show())
    }), e.$where.mouseleave(function(e) {
        $("#box3").hide(), $("#pointer").hide()
    })
}, haste.prototype.configureShortcuts = function() {
    var e = this;
    $(document.body).keydown(function(t) {
        var n;
        for (var r = 0; r < e.buttons.length; r++) {
            n = e.buttons[r];
            if (n.shortcut && n.shortcut(t)) {
                t.preventDefault(), n.action();
                return
            }
        }
    })
}, $(function() {
    $("textarea").keydown(function(e) {
        if (e.keyCode === 9) {
            e.preventDefault();
            var t = "  ";
            if (document.selection) this.focus(), sel = document.selection.createRange(), sel.text = t, this.focus();
            else if (this.selectionStart || this.selectionStart == "0") {
                var n = this.selectionStart,
                    r = this.selectionEnd,
                    i = this.scrollTop;
                this.value = this.value.substring(0, n) + t + this.value.substring(r, this.value.length), this.focus(), this.selectionStart = n + t.length, this.selectionEnd = n + t.length, this.scrollTop = i
            } else this.value += t, this.focus()
        }
    })
})