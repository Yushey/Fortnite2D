// User logs in
function login() {
    $.ajax({
        method: "POST",
        url: "/api/login/",
        data: {
            username: $("#username").val(),
            password: $("#password").val()
        },
        error: function(error) {
            document.getElementById("msglog").innerHTML = "Invalid Username or Password";
            resetFields("inv");
        }
    }).done(function(data) {
        if (data != "Invalid authentication") {
            sessionStorage.setItem("user", $("#username").val());
            sessionStorage.setItem("pass", $("#password").val());
            switchToGame();
        }
    });
}

// User registers an account
function register() {
    if ($("#passwordreg").val() != $("#passwordrpt").val()) {
        document.getElementById("msg").innerHTML = "Passwords do not match";
        resetFields(false);
    } else if ($("#passwordreg").val().length < 6) {
        document.getElementById("msg").innerHTML = "Password must be atleast 6 characters";
        resetFields(false);
    } else {
        $.ajax({
            method: "POST",
            url: "/api/register/",
            data: {
                user: $("#usernamereg").val(),
                pass: $("#passwordreg").val()
            },
            error: function(error) {
                document.getElementById("msg").innerHTML = "This username is taken by someone else.";
                resetFields("reg");
            }
        }).done(function(data) {
            alert("Successfully Registered");
            resetFields(true);
            switchToLogin();

            // show play form and hide newGameForm
            // then getHistory or clear history div
        });
    }
}

//reset the textfields
function resetFields(b) {
    var elements = document.getElementsByTagName("input");
    for (var ii = 0; ii < elements.length; ii++) {
        if (b == true || b == "inv") {
            if (elements[ii].type == "text") {
                elements[ii].value = "";
            }
        }
        if (elements[ii].type == "password") {
            elements[ii].value = "";
        }
    }
    if (b == true || b == "inv" || b == "reg") {
        if (b == true) {
            document.getElementById("msg").innerHTML = "";
            document.getElementById("msglog").innerHTML = "";
            document.getElementById("msgsettings").innerHTML = "";
        } else if (b == "inv") {
            document.getElementById("msg").innerHTML = "";
        } else {
            document.getElementById("msglog").innerHTML = "";
        }
    }
}

//switch to register page
function switchToRegister() {
    resetFields(true);
    sessionStorage.setItem("state", "register"); // Store
    $("#login").hide();
    $("#register").show();
    $("#game").hide();
    $("#settings").hide();
}

//switch to login page
function switchToLogin() {
    resetFields(true);
    getHighscores();
    sessionStorage.setItem("state", "login"); // Store
    $("#register").hide();
    $("#login").show();
    $("#game").hide();
    $("#settings").hide();
}

//switch to game view
function switchToGame() {
    var output = $.authentication();
    if (output == true) {
        sessionStorage.setItem("state", "game"); // Store
        getKillCount();
        setupGame();
        startGame();
        $("#login").hide();
        $("#register").hide();
        $("#game").show();
        $("#settings").hide();
    } else {
        switchToLogin();
    }
}

//go from settings back to the game
function settingsResume() {
    var output = $.authentication();
    if (output == true) {
        sessionStorage.setItem("state", "game"); // Store
        getKillCount();
        $("#login").hide();
        $("#register").hide();
        $("#game").show();
        $("#settings").hide();
    } else {
        switchToLogin();
    }
}

//switch to game view
function switchToSettings() {
    var output = $.authentication();
    if (output == true) {
        resetFields(true);
        sessionStorage.setItem("state", "settings"); // Store
        document.getElementById("usersettings").value = sessionStorage.getItem("user");
        $("#login").hide();
        $("#register").hide();
        $("#game").hide();
        $("#settings").show();
    } else {
        switchToLogin();
    }
}

//get the killcount of the user
function getKillCount() {
    var temp  = $.getKills();
    updateKillCounter(temp);
    return temp;
}
$.extend({
    getKills: function() {
        var totalKills = 0;
        $.ajax({
            method: "GET",
            url: "/api/getKills/",
            data: {
                username: sessionStorage.getItem("user")
            },
            async: false,
            success: function(data) {
                var temp = data.kills;
                totalKills = temp[0].numkills;
                // updateKillCounter(totalKills);
            }
        });
        return totalKills;
    }
});

//update killcount
function updateKillCounter(kills) {
    $.ajax({
        method: "POST",
        url: "/api/updateKills/",
        data: {
            numkills: kills,
            username: sessionStorage.getItem("user")
        }
    }).done(function(data) {
        document.getElementById("killcount").innerHTML = "Kill Count: " + kills.toString(10);
    });
}

//get the highscores
function getHighscores() {
    $.ajax({
        method: "GET",
        url: "/api/getHighscores/",
    }).done(function(data) {
        var output = data.highscores;
        var iu = null; //id for username in the html
        var ik = null; //id for the kill count in the html

        //loop through the highscore data, and apply the highscores table
        for (var i = 0; i < output.length; i++) {
            iu = i.toString(10) + "u";
            ik = i.toString(10) + "k";
            document.getElementById(iu).innerHTML = output[i]["username"];
            document.getElementById(ik).innerHTML = output[i]["numkills"];
        }
    });
}

//change password with front and backend validation
function changePass() {
    var output = $.authentication();
    if (output == true) {
        currentpass = document.getElementById("pswd").value;
        passwordnew = document.getElementById("pswdnew").value;
        passwordrpt = document.getElementById("pswdrpt").value;

        if (passwordnew != passwordrpt) {
            resetFields(true);
            switchToSettings();
            document.getElementById("msgsettings").innerHTML = "Your new passwords do not match!";
        } else if (currentpass != sessionStorage.getItem("pass")) {
            resetFields();
            switchToSettings();
            document.getElementById("msgsettings").innerHTML = "That is the incorrect password.";
        } else if (passwordnew.length < 5) {
            resetFields();
            switchToSettings();
            document.getElementById("msgsettings").innerHTML = "New password must be atleast 6 characters.";
        } else {
            $.ajax({
                method: "POST",
                url: "/api/changePass/",
                data: {
                    username: sessionStorage.getItem("user"),
                    newpass: passwordnew
                }
            }).done(function(data) {
                if (data == "Success") {
                    sessionStorage.setItem("pass", passwordnew);
                    resetFields(true);
                    switchToSettings();
                    document.getElementById("msgsettings").innerHTML = "Password successfully updated!";
                }
            });
        }
    } else {
        switchToLogin();
    }
}

//authenticate the user
$.extend({
    authentication: function() {
        var username = sessionStorage.getItem("user");
        var password = sessionStorage.getItem("pass");
        var check = false;
        $.ajax({
            method: "POST",
            url: "/api/authen/",
            data: {
                username: username,
                password: password
            },
            async: false,
            success: function(data) {
                if (data == "Success") {
                    check = true;
                } else {
                    check = false;
                }
            }
        });
        return check;
    }
});

$(function() {
    // Setup all events here and display the appropriate UI
    $("#Submit").on('click', function() {
        login();
    });

    $("#settings1").on('click', function() {
        switchToSettings();
    });

    $("#Register").on('click', function() {
        switchToRegister();
    });

    $("#loginreg").on('click', function() {
        switchToLogin();
    });

    $("#registerbtn").on('click', function() {
        register();
    });

    $("#returngame").on('click', function() {
        settingsResume();
    });

    $("#settingsbtn").on('click', function() {
        changePass();
    });

    $("#logout").on('click', function() {
        sessionStorage.clear();
        pauseGame();
        resetFields(true);
        switchToLogin();
    });


    //check for sessionStorage and set the page accordingly.
    if (sessionStorage.getItem("state") == "game") {
        switchToGame();
    } else if (sessionStorage.getItem("state") == "login") {
        switchToLogin();
    } else if (sessionStorage.getItem("state") == "register") {
        switchToRegister();
    } else if (sessionStorage.getItem("state") == "settings") {
        switchToSettings();
    } else {
        switchToLogin();
    }

});

//click a button, when you press enter
$(document).ready(function() {
    //if user is on the "password" field in the login page
    //and they press enter, click on "Submit".
    $('#password').keypress(function(e) {
        if (e.keyCode == 13)
            $('#Submit').click();
    });

    //if user is on the "passwordrpt" field in the login page
    //and they press enter, click on "registerbtn".
    $('#passwordrpt').keypress(function(e) {
        if (e.keyCode == 13)
            $('#registerbtn').click();
    });

    $('#pswdrpt').keypress(function(e) {
        if (e.keyCode == 13)
            $('#settingsbtn').click();
    });
});
